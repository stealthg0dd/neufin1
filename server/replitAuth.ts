import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

if (!process.env.REPLIT_DOMAINS) {
  throw new Error("Environment variable REPLIT_DOMAINS not provided");
}

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET || "neufinSessionSecretDev",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(
  claims: any,
) {
  const userId = claims["sub"];
  
  return await storage.upsertUser({
    id: userId,
    email: claims["email"] || null,
    firstName: claims["first_name"] || null,
    lastName: claims["last_name"] || null,
    profileImageUrl: claims["profile_image_url"] || null,
  });
}

export async function setupAuth(app: Express) {
  try {
    app.set("trust proxy", 1);
    app.use(getSession());
    app.use(passport.initialize());
    app.use(passport.session());

    console.log("Configuring OpenID Connect with Replit...");
    const config = await getOidcConfig();

    const verify: VerifyFunction = async (
      tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
      verified: passport.AuthenticateCallback
    ) => {
      try {
        const user = {};
        updateUserSession(user, tokens);
        await upsertUser(tokens.claims());
        verified(null, user);
      } catch (error) {
        console.error("Error during token verification:", error);
        verified(error as Error);
      }
    };

    const domains = process.env.REPLIT_DOMAINS!.split(",");
    console.log(`Setting up auth for domains: ${domains.join(", ")}`);
    
    for (const domain of domains) {
      const trimmedDomain = domain.trim();
      console.log(`Registering strategy for domain: ${trimmedDomain}`);
      
      const strategy = new Strategy(
        {
          name: `replitauth:${trimmedDomain}`,
          config,
          scope: "openid email profile offline_access",
          callbackURL: `https://${trimmedDomain}/api/callback`,
        },
        verify,
      );
      passport.use(strategy);
    }

    passport.serializeUser((user: Express.User, cb) => cb(null, user));
    passport.deserializeUser((user: Express.User, cb) => cb(null, user));

    // Direct login for development - use this for direct email/password auth
    app.post('/api/auth/direct-login', (req, res) => {
      // Mock user for development
      const mockUser = {
        id: "dev123",
        email: req.body.email || "user@example.com",
        firstName: "Development",
        lastName: "User",
        profileImageUrl: "https://i.pravatar.cc/150?u=dev123"
      };
      
      req.login({
        claims: {
          sub: mockUser.id,
          email: mockUser.email,
          first_name: mockUser.firstName,
          last_name: mockUser.lastName,
          profile_image_url: mockUser.profileImageUrl
        }
      }, err => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        return res.json(mockUser);
      });
    });

    // Login endpoint with better error handling
    app.get("/api/login", (req, res, next) => {
      console.log(`Authentication request from hostname: ${req.hostname}`);
      
      // Get the appropriate strategy based on hostname
      const strategyName = `replitauth:${req.hostname}`;
      
      if (!passport._strategies[strategyName]) {
        console.error(`Strategy not found: ${strategyName}`);
        console.log("Available strategies:", Object.keys(passport._strategies));
        
        // Try to find a matching strategy
        const availableStrategies = Object.keys(passport._strategies)
          .filter(name => name.startsWith('replitauth:'));
        
        if (availableStrategies.length > 0) {
          const alternativeStrategy = availableStrategies[0];
          console.log(`Using alternative strategy: ${alternativeStrategy}`);
          
          passport.authenticate(alternativeStrategy, {
            prompt: "login consent",
            scope: ["openid", "email", "profile", "offline_access"],
          })(req, res, next);
        } else {
          return res.status(500).json({ 
            error: "Authentication configuration error",
            message: "Please try again later or contact support"
          });
        }
      } else {
        passport.authenticate(strategyName, {
          prompt: "login consent",
          scope: ["openid", "email", "profile", "offline_access"],
        })(req, res, next);
      }
    });

    // Callback endpoint with improved error handling
    app.get("/api/callback", (req, res, next) => {
      console.log(`Callback received from hostname: ${req.hostname}`);
      
      const strategyName = `replitauth:${req.hostname}`;
      
      if (!passport._strategies[strategyName]) {
        console.error(`Strategy not found for callback: ${strategyName}`);
        
        // Try to find a matching strategy
        const availableStrategies = Object.keys(passport._strategies)
          .filter(name => name.startsWith('replitauth:'));
        
        if (availableStrategies.length > 0) {
          const alternativeStrategy = availableStrategies[0];
          console.log(`Using alternative strategy for callback: ${alternativeStrategy}`);
          
          passport.authenticate(alternativeStrategy, {
            successReturnToOrRedirect: "/dashboard",
            failureRedirect: "/login-error",
          })(req, res, next);
        } else {
          return res.redirect("/login-error");
        }
      } else {
        passport.authenticate(strategyName, {
          successReturnToOrRedirect: "/dashboard",
          failureRedirect: "/login-error",
        })(req, res, next);
      }
    });

    // Login error redirect
    app.get("/login-error", (req, res) => {
      res.status(400).json({ 
        error: "Login failed", 
        message: "Authentication process could not be completed. Please try again." 
      });
    });

    // Logout endpoint
    app.get("/api/logout", (req, res) => {
      req.logout(() => {
        res.redirect(
          client.buildEndSessionUrl(config, {
            client_id: process.env.REPL_ID!,
            post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
          }).href
        );
      });
    });
    
    console.log("Authentication setup completed successfully");
  } catch (error) {
    console.error("Failed to set up authentication:", error);
  }
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = req.user as any;

  if (!req.isAuthenticated() || !user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    return res.redirect("/api/login");
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    return res.redirect("/api/login");
  }
};