import { NextAuthOptions } from 'next-auth';
import DiscordProvider from 'next-auth/providers/discord';

const DISCORD_SCOPES = ['identify', 'guilds'].join(' ');

export const authOptions: NextAuthOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      authorization: { params: { scope: DISCORD_SCOPES } },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token;
        token.tokenType = account.token_type;
      }
      if (profile) {
        // Guarda o ID do utilizador Discord no token
        token.userId = (profile as { id: string }).id;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.user.id = token.userId as string;

      if (token.picture) {
        const pic = token.picture as string;
        session.user.image = pic.includes('?') ? pic : `${pic}?size=128`;
      }

      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
