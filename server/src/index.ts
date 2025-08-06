
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import { z } from 'zod';

// Import schemas
import { 
  createPromoInputSchema,
  createProductInputSchema,
  createArticleInputSchema,
  createCommentInputSchema,
  createContactMessageInputSchema,
  createServiceBookingInputSchema
} from './schema';

// Import handlers
import { getPromos } from './handlers/get_promos';
import { createPromo } from './handlers/create_promo';
import { getProducts } from './handlers/get_products';
import { getProductById } from './handlers/get_product_by_id';
import { createProduct } from './handlers/create_product';
import { getArticles } from './handlers/get_articles';
import { getArticleById } from './handlers/get_article_by_id';
import { createArticle } from './handlers/create_article';
import { likeArticle } from './handlers/like_article';
import { getCommentsByArticle } from './handlers/get_comments_by_article';
import { createComment } from './handlers/create_comment';
import { createContactMessage } from './handlers/create_contact_message';
import { createServiceBooking } from './handlers/create_service_booking';
import { getServiceBookings } from './handlers/get_service_bookings';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),
  
  // Promo routes
  getPromos: publicProcedure
    .query(() => getPromos()),
  createPromo: publicProcedure
    .input(createPromoInputSchema)
    .mutation(({ input }) => createPromo(input)),
  
  // Product routes
  getProducts: publicProcedure
    .query(() => getProducts()),
  getProductById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(({ input }) => getProductById(input.id)),
  createProduct: publicProcedure
    .input(createProductInputSchema)
    .mutation(({ input }) => createProduct(input)),
  
  // Article routes
  getArticles: publicProcedure
    .query(() => getArticles()),
  getArticleById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(({ input }) => getArticleById(input.id)),
  createArticle: publicProcedure
    .input(createArticleInputSchema)
    .mutation(({ input }) => createArticle(input)),
  likeArticle: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => likeArticle(input.id)),
  
  // Comment routes
  getCommentsByArticle: publicProcedure
    .input(z.object({ articleId: z.number() }))
    .query(({ input }) => getCommentsByArticle(input.articleId)),
  createComment: publicProcedure
    .input(createCommentInputSchema)
    .mutation(({ input }) => createComment(input)),
  
  // Contact routes
  createContactMessage: publicProcedure
    .input(createContactMessageInputSchema)
    .mutation(({ input }) => createContactMessage(input)),
  
  // Service booking routes
  createServiceBooking: publicProcedure
    .input(createServiceBookingInputSchema)
    .mutation(({ input }) => createServiceBooking(input)),
  getServiceBookings: publicProcedure
    .query(() => getServiceBookings()),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();
