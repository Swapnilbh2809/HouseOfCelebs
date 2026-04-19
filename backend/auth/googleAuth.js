const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || 'placeholder',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'placeholder',
    callbackURL: "/api/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists
      let user = await User.findOne({ googleId: profile.id });

      if (user) {
        return done(null, user);
      } else {
        // Create new user
        const newUser = await User.create({
          googleId: profile.id,
          email: profile.emails[0].value,
          name: profile.displayName,
          avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : '',
          role: 'user' // Default role
        });
        return done(null, newUser);
      }
    } catch (err) {
      console.error("Error in Google Auth Strategy:", err);
      return done(err, null);
    }
  }
));

// Session handling
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
