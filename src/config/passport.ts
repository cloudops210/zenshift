import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import User from '../models/User';

passport.serializeUser((user: any, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

// Google Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackURL: `${process.env.BACKEND_BASE_URL}/api/auth/google/callback`,
    scope: ['profile', 'email']
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
            user = await User.findOne({ email: profile.emails?.[0].value });

            if (user) {
                user.googleId = profile.id;
                user.name = user.name || profile.displayName;
                user.avatar = user.avatar || profile.photos?.[0].value;
                user.isEmailVerified = true;
                await user.save();
            } else {
                user = await User.create({
                    email: profile.emails?.[0].value,
                    googleId: profile.id,
                    name: profile.displayName,
                    avatar: profile.photos?.[0].value,
                    isEmailVerified: true
                });
            }
        }

        return done(null, user);
    } catch (error) {
        return done(error as Error, undefined);
    }
}));

// Facebook Strategy
passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID || '',
    clientSecret: process.env.FACEBOOK_APP_SECRET || '',
    callbackURL: `${process.env.BACKEND_BASE_URL}/api/auth/facebook/callback`,
    profileFields: ['id', 'emails', 'name', 'picture.type(large)']
}, async (accessToken, refreshToken, profile, done) => {
    try {
        console.log('profile', profile)
        let user = await User.findOne({ facebookId: profile.id });

        if (!user) {
            user = await User.findOne({ email: profile.emails?.[0].value });

            if (user) {
                user.facebookId = profile.id;
                user.name = user.name || `${profile.name?.givenName} ${profile.name?.familyName}`;
                user.avatar = user.avatar || profile.photos?.[0].value;
                user.isEmailVerified = true;
                await user.save();
            } else {
                user = await User.create({
                    email: profile.emails?.[0].value,
                    facebookId: profile.id,
                    name: `${profile.name?.givenName} ${profile.name?.familyName}`,
                    avatar: profile.photos?.[0].value,
                    isEmailVerified: true
                });
            }
        }

        return done(null, user);
    } catch (error) {
        return done(error as Error, undefined);
    }
}));

export default passport; 