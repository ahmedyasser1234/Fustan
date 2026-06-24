--
-- PostgreSQL database dump
--

\restrict RGBLzaGiffLK73pHqJp5eb4LSqUeicSz63ArzckqDRtjCy9BrOB6JWHM3TEKNgz

-- Dumped from database version 16.11
-- Dumped by pg_dump version 16.11

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: drizzle; Type: SCHEMA; Schema: -; Owner: fustan_user
--

CREATE SCHEMA drizzle;


ALTER SCHEMA drizzle OWNER TO fustan_user;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: __drizzle_migrations; Type: TABLE; Schema: drizzle; Owner: fustan_user
--

CREATE TABLE drizzle.__drizzle_migrations (
    id integer NOT NULL,
    hash text NOT NULL,
    created_at bigint
);


ALTER TABLE drizzle.__drizzle_migrations OWNER TO fustan_user;

--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE; Schema: drizzle; Owner: fustan_user
--

CREATE SEQUENCE drizzle.__drizzle_migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE drizzle.__drizzle_migrations_id_seq OWNER TO fustan_user;

--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: drizzle; Owner: fustan_user
--

ALTER SEQUENCE drizzle.__drizzle_migrations_id_seq OWNED BY drizzle.__drizzle_migrations.id;


--
-- Name: aiPlans; Type: TABLE; Schema: public; Owner: fustan_user
--

CREATE TABLE public."aiPlans" (
    id integer NOT NULL,
    "nameAr" text NOT NULL,
    "nameEn" text NOT NULL,
    "descriptionAr" text,
    "descriptionEn" text,
    price double precision NOT NULL,
    credits integer NOT NULL,
    "durationDays" integer DEFAULT 30,
    "isActive" boolean DEFAULT true,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public."aiPlans" OWNER TO fustan_user;

--
-- Name: aiPlans_id_seq; Type: SEQUENCE; Schema: public; Owner: fustan_user
--

CREATE SEQUENCE public."aiPlans_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."aiPlans_id_seq" OWNER TO fustan_user;

--
-- Name: aiPlans_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: fustan_user
--

ALTER SEQUENCE public."aiPlans_id_seq" OWNED BY public."aiPlans".id;


--
-- Name: aiTasks; Type: TABLE; Schema: public; Owner: fustan_user
--

CREATE TABLE public."aiTasks" (
    id text NOT NULL,
    type text NOT NULL,
    "targetId" integer,
    status text DEFAULT 'pending'::text NOT NULL,
    "resultUrl" text,
    error text,
    metadata jsonb,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public."aiTasks" OWNER TO fustan_user;

--
-- Name: cartItems; Type: TABLE; Schema: public; Owner: fustan_user
--

CREATE TABLE public."cartItems" (
    id integer NOT NULL,
    "customerId" integer NOT NULL,
    "productId" integer NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    size text,
    "addedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "customMeasurements" jsonb
);


ALTER TABLE public."cartItems" OWNER TO fustan_user;

--
-- Name: cartItems_id_seq; Type: SEQUENCE; Schema: public; Owner: fustan_user
--

CREATE SEQUENCE public."cartItems_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."cartItems_id_seq" OWNER TO fustan_user;

--
-- Name: cartItems_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: fustan_user
--

ALTER SEQUENCE public."cartItems_id_seq" OWNED BY public."cartItems".id;


--
-- Name: categories; Type: TABLE; Schema: public; Owner: fustan_user
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    "nameAr" text NOT NULL,
    "nameEn" text NOT NULL,
    slug text NOT NULL,
    "descriptionAr" text,
    "descriptionEn" text,
    image text,
    "parentId" integer,
    "isActive" boolean DEFAULT true,
    "displayOrder" integer DEFAULT 0,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "aiBackgroundImage" text,
    "categoryBackgroundUrl" text,
    "categoryBackgroundPrompt" text
);


ALTER TABLE public.categories OWNER TO fustan_user;

--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: fustan_user
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categories_id_seq OWNER TO fustan_user;

--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: fustan_user
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: collections; Type: TABLE; Schema: public; Owner: fustan_user
--

CREATE TABLE public.collections (
    id integer NOT NULL,
    "vendorId" integer NOT NULL,
    "nameAr" text NOT NULL,
    "nameEn" text NOT NULL,
    slug text NOT NULL,
    description text,
    "coverImage" text,
    "categoryId" integer,
    "isActive" boolean DEFAULT true,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.collections OWNER TO fustan_user;

--
-- Name: collections_id_seq; Type: SEQUENCE; Schema: public; Owner: fustan_user
--

CREATE SEQUENCE public.collections_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.collections_id_seq OWNER TO fustan_user;

--
-- Name: collections_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: fustan_user
--

ALTER SEQUENCE public.collections_id_seq OWNED BY public.collections.id;


--
-- Name: contentItems; Type: TABLE; Schema: public; Owner: fustan_user
--

CREATE TABLE public."contentItems" (
    id integer NOT NULL,
    type text NOT NULL,
    data jsonb NOT NULL,
    "isActive" boolean DEFAULT true,
    "displayOrder" integer DEFAULT 0,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public."contentItems" OWNER TO fustan_user;

--
-- Name: contentItems_id_seq; Type: SEQUENCE; Schema: public; Owner: fustan_user
--

CREATE SEQUENCE public."contentItems_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."contentItems_id_seq" OWNER TO fustan_user;

--
-- Name: contentItems_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: fustan_user
--

ALTER SEQUENCE public."contentItems_id_seq" OWNED BY public."contentItems".id;


--
-- Name: conversations; Type: TABLE; Schema: public; Owner: fustan_user
--

CREATE TABLE public.conversations (
    id integer NOT NULL,
    "customerId" integer NOT NULL,
    "vendorId" integer NOT NULL,
    "lastMessageId" integer,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.conversations OWNER TO fustan_user;

--
-- Name: conversations_id_seq; Type: SEQUENCE; Schema: public; Owner: fustan_user
--

CREATE SEQUENCE public.conversations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.conversations_id_seq OWNER TO fustan_user;

--
-- Name: conversations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: fustan_user
--

ALTER SEQUENCE public.conversations_id_seq OWNED BY public.conversations.id;


--
-- Name: coupons; Type: TABLE; Schema: public; Owner: fustan_user
--

CREATE TABLE public.coupons (
    id integer NOT NULL,
    "vendorId" integer NOT NULL,
    code text NOT NULL,
    "discountPercent" integer NOT NULL,
    "maxUses" integer,
    "usedCount" integer DEFAULT 0,
    "expiresAt" timestamp without time zone,
    "isActive" boolean DEFAULT true,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.coupons OWNER TO fustan_user;

--
-- Name: coupons_id_seq; Type: SEQUENCE; Schema: public; Owner: fustan_user
--

CREATE SEQUENCE public.coupons_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.coupons_id_seq OWNER TO fustan_user;

--
-- Name: coupons_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: fustan_user
--

ALTER SEQUENCE public.coupons_id_seq OWNED BY public.coupons.id;


--
-- Name: messages; Type: TABLE; Schema: public; Owner: fustan_user
--

CREATE TABLE public.messages (
    id integer NOT NULL,
    "conversationId" integer NOT NULL,
    "senderId" integer NOT NULL,
    "senderRole" text NOT NULL,
    content text NOT NULL,
    "isRead" boolean DEFAULT false,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.messages OWNER TO fustan_user;

--
-- Name: messages_id_seq; Type: SEQUENCE; Schema: public; Owner: fustan_user
--

CREATE SEQUENCE public.messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.messages_id_seq OWNER TO fustan_user;

--
-- Name: messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: fustan_user
--

ALTER SEQUENCE public.messages_id_seq OWNED BY public.messages.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: fustan_user
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    type text NOT NULL,
    title text NOT NULL,
    message text,
    "relatedId" integer,
    "isRead" boolean DEFAULT false,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.notifications OWNER TO fustan_user;

--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: fustan_user
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifications_id_seq OWNER TO fustan_user;

--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: fustan_user
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: offerItems; Type: TABLE; Schema: public; Owner: fustan_user
--

CREATE TABLE public."offerItems" (
    id integer NOT NULL,
    "offerId" integer NOT NULL,
    "productId" integer NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public."offerItems" OWNER TO fustan_user;

--
-- Name: offerItems_id_seq; Type: SEQUENCE; Schema: public; Owner: fustan_user
--

CREATE SEQUENCE public."offerItems_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."offerItems_id_seq" OWNER TO fustan_user;

--
-- Name: offerItems_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: fustan_user
--

ALTER SEQUENCE public."offerItems_id_seq" OWNED BY public."offerItems".id;


--
-- Name: offers; Type: TABLE; Schema: public; Owner: fustan_user
--

CREATE TABLE public.offers (
    id integer NOT NULL,
    "vendorId" integer NOT NULL,
    "nameAr" text NOT NULL,
    "nameEn" text NOT NULL,
    "discountPercent" integer NOT NULL,
    "startDate" timestamp without time zone NOT NULL,
    "endDate" timestamp without time zone NOT NULL,
    "usageLimit" integer,
    "minQuantity" integer DEFAULT 1,
    "usedCount" integer DEFAULT 0,
    "isActive" boolean DEFAULT true,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.offers OWNER TO fustan_user;

--
-- Name: offers_id_seq; Type: SEQUENCE; Schema: public; Owner: fustan_user
--

CREATE SEQUENCE public.offers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.offers_id_seq OWNER TO fustan_user;

--
-- Name: offers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: fustan_user
--

ALTER SEQUENCE public.offers_id_seq OWNED BY public.offers.id;


--
-- Name: orderItems; Type: TABLE; Schema: public; Owner: fustan_user
--

CREATE TABLE public."orderItems" (
    id integer NOT NULL,
    "orderId" integer NOT NULL,
    "productId" integer NOT NULL,
    "vendorId" integer NOT NULL,
    quantity integer NOT NULL,
    price double precision NOT NULL,
    total double precision NOT NULL,
    size text,
    color text,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "customMeasurements" jsonb
);


ALTER TABLE public."orderItems" OWNER TO fustan_user;

--
-- Name: orderItems_id_seq; Type: SEQUENCE; Schema: public; Owner: fustan_user
--

CREATE SEQUENCE public."orderItems_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."orderItems_id_seq" OWNER TO fustan_user;

--
-- Name: orderItems_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: fustan_user
--

ALTER SEQUENCE public."orderItems_id_seq" OWNED BY public."orderItems".id;


--
-- Name: orders; Type: TABLE; Schema: public; Owner: fustan_user
--

CREATE TABLE public.orders (
    id integer NOT NULL,
    "orderNumber" text NOT NULL,
    "customerId" integer NOT NULL,
    "vendorId" integer,
    status text DEFAULT 'pending'::text NOT NULL,
    subtotal double precision NOT NULL,
    "shippingCost" double precision DEFAULT 0,
    tax double precision DEFAULT 0,
    discount double precision DEFAULT 0,
    commission double precision DEFAULT 0,
    total double precision NOT NULL,
    "shippingAddress" jsonb,
    "billingAddress" jsonb,
    "paymentMethod" text,
    "paymentStatus" text DEFAULT 'pending'::text NOT NULL,
    "stripePaymentId" text,
    "trackingNumber" text,
    notes text,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.orders OWNER TO fustan_user;

--
-- Name: orders_id_seq; Type: SEQUENCE; Schema: public; Owner: fustan_user
--

CREATE SEQUENCE public.orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.orders_id_seq OWNER TO fustan_user;

--
-- Name: orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: fustan_user
--

ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;


--
-- Name: pointsTransactions; Type: TABLE; Schema: public; Owner: fustan_user
--

CREATE TABLE public."pointsTransactions" (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    amount integer NOT NULL,
    type text NOT NULL,
    description text,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public."pointsTransactions" OWNER TO fustan_user;

--
-- Name: pointsTransactions_id_seq; Type: SEQUENCE; Schema: public; Owner: fustan_user
--

CREATE SEQUENCE public."pointsTransactions_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."pointsTransactions_id_seq" OWNER TO fustan_user;

--
-- Name: pointsTransactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: fustan_user
--

ALTER SEQUENCE public."pointsTransactions_id_seq" OWNED BY public."pointsTransactions".id;


--
-- Name: productColors; Type: TABLE; Schema: public; Owner: fustan_user
--

CREATE TABLE public."productColors" (
    id integer NOT NULL,
    "productId" integer NOT NULL,
    "colorName" text NOT NULL,
    "colorCode" text NOT NULL,
    images jsonb,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public."productColors" OWNER TO fustan_user;

--
-- Name: productColors_id_seq; Type: SEQUENCE; Schema: public; Owner: fustan_user
--

CREATE SEQUENCE public."productColors_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."productColors_id_seq" OWNER TO fustan_user;

--
-- Name: productColors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: fustan_user
--

ALTER SEQUENCE public."productColors_id_seq" OWNED BY public."productColors".id;


--
-- Name: products; Type: TABLE; Schema: public; Owner: fustan_user
--

CREATE TABLE public.products (
    id integer NOT NULL,
    "vendorId" integer NOT NULL,
    "collectionId" integer,
    "categoryId" integer,
    "brandId" integer,
    "nameAr" text NOT NULL,
    "nameEn" text NOT NULL,
    slug text NOT NULL,
    "descriptionAr" text,
    "descriptionEn" text,
    sizes jsonb,
    "shortDescription" text,
    "vendorPrice" double precision,
    "vendorOriginalPrice" double precision,
    price double precision NOT NULL,
    "originalPrice" double precision,
    discount double precision DEFAULT 0,
    sku text,
    stock integer DEFAULT 0,
    images jsonb,
    specifications jsonb,
    "cutType" text,
    "bodyShape" text,
    impression text,
    occasion text,
    silhouette text,
    rating double precision DEFAULT 0,
    "reviewCount" integer DEFAULT 0,
    "isActive" boolean DEFAULT true,
    "isFeatured" boolean DEFAULT false,
    "aiQualifiedImage" text,
    tags jsonb,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    availability text DEFAULT 'sale'::text,
    condition text DEFAULT 'new'::text,
    "usageCount" integer DEFAULT 0,
    "rentPrice" double precision,
    "salePrice" double precision,
    "usagePrices" jsonb
);


ALTER TABLE public.products OWNER TO fustan_user;

--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: fustan_user
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.products_id_seq OWNER TO fustan_user;

--
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: fustan_user
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- Name: reviews; Type: TABLE; Schema: public; Owner: fustan_user
--

CREATE TABLE public.reviews (
    id integer NOT NULL,
    "productId" integer NOT NULL,
    "customerId" integer NOT NULL,
    rating integer NOT NULL,
    title text,
    comment text,
    images jsonb,
    "isVerifiedPurchase" boolean DEFAULT false,
    helpful integer DEFAULT 0,
    unhelpful integer DEFAULT 0,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.reviews OWNER TO fustan_user;

--
-- Name: reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: fustan_user
--

CREATE SEQUENCE public.reviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reviews_id_seq OWNER TO fustan_user;

--
-- Name: reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: fustan_user
--

ALTER SEQUENCE public.reviews_id_seq OWNED BY public.reviews.id;


--
-- Name: shipping; Type: TABLE; Schema: public; Owner: fustan_user
--

CREATE TABLE public.shipping (
    id integer NOT NULL,
    "productId" integer NOT NULL,
    "vendorId" integer NOT NULL,
    "shippingCost" double precision DEFAULT 0 NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.shipping OWNER TO fustan_user;

--
-- Name: shipping_id_seq; Type: SEQUENCE; Schema: public; Owner: fustan_user
--

CREATE SEQUENCE public.shipping_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.shipping_id_seq OWNER TO fustan_user;

--
-- Name: shipping_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: fustan_user
--

ALTER SEQUENCE public.shipping_id_seq OWNED BY public.shipping.id;


--
-- Name: storeReviews; Type: TABLE; Schema: public; Owner: fustan_user
--

CREATE TABLE public."storeReviews" (
    id integer NOT NULL,
    "customerId" integer,
    "guestName" text,
    city text,
    rating integer NOT NULL,
    comment text,
    "isApproved" boolean DEFAULT true,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public."storeReviews" OWNER TO fustan_user;

--
-- Name: storeReviews_id_seq; Type: SEQUENCE; Schema: public; Owner: fustan_user
--

CREATE SEQUENCE public."storeReviews_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."storeReviews_id_seq" OWNER TO fustan_user;

--
-- Name: storeReviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: fustan_user
--

ALTER SEQUENCE public."storeReviews_id_seq" OWNED BY public."storeReviews".id;


--
-- Name: userAiCredits; Type: TABLE; Schema: public; Owner: fustan_user
--

CREATE TABLE public."userAiCredits" (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    "totalCredits" integer DEFAULT 0 NOT NULL,
    "usedCredits" integer DEFAULT 0 NOT NULL,
    "remainingCredits" integer DEFAULT 0 NOT NULL,
    "expiresAt" timestamp without time zone,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "planId" integer
);


ALTER TABLE public."userAiCredits" OWNER TO fustan_user;

--
-- Name: userAiCredits_id_seq; Type: SEQUENCE; Schema: public; Owner: fustan_user
--

CREATE SEQUENCE public."userAiCredits_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."userAiCredits_id_seq" OWNER TO fustan_user;

--
-- Name: userAiCredits_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: fustan_user
--

ALTER SEQUENCE public."userAiCredits_id_seq" OWNED BY public."userAiCredits".id;


--
-- Name: userPoints; Type: TABLE; Schema: public; Owner: fustan_user
--

CREATE TABLE public."userPoints" (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    points integer DEFAULT 0 NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public."userPoints" OWNER TO fustan_user;

--
-- Name: userPoints_id_seq; Type: SEQUENCE; Schema: public; Owner: fustan_user
--

CREATE SEQUENCE public."userPoints_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."userPoints_id_seq" OWNER TO fustan_user;

--
-- Name: userPoints_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: fustan_user
--

ALTER SEQUENCE public."userPoints_id_seq" OWNED BY public."userPoints".id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: fustan_user
--

CREATE TABLE public.users (
    id integer NOT NULL,
    "openId" text NOT NULL,
    name text,
    email text,
    phone text,
    whatsapp text,
    address text,
    password text,
    "loginMethod" text,
    role text DEFAULT 'customer'::text NOT NULL,
    avatar text,
    measurements jsonb,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "lastSignedIn" timestamp without time zone DEFAULT now() NOT NULL,
    "isEmailVerified" boolean DEFAULT false NOT NULL,
    otp text,
    "otpExpiresAt" timestamp without time zone
);


ALTER TABLE public.users OWNER TO fustan_user;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: fustan_user
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO fustan_user;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: fustan_user
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: vendorPayouts; Type: TABLE; Schema: public; Owner: fustan_user
--

CREATE TABLE public."vendorPayouts" (
    id integer NOT NULL,
    "vendorId" integer NOT NULL,
    amount double precision NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    period text,
    "stripePayoutId" text,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public."vendorPayouts" OWNER TO fustan_user;

--
-- Name: vendorPayouts_id_seq; Type: SEQUENCE; Schema: public; Owner: fustan_user
--

CREATE SEQUENCE public."vendorPayouts_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."vendorPayouts_id_seq" OWNER TO fustan_user;

--
-- Name: vendorPayouts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: fustan_user
--

ALTER SEQUENCE public."vendorPayouts_id_seq" OWNED BY public."vendorPayouts".id;


--
-- Name: vendorRequests; Type: TABLE; Schema: public; Owner: fustan_user
--

CREATE TABLE public."vendorRequests" (
    id integer NOT NULL,
    "vendorId" integer NOT NULL,
    type text NOT NULL,
    data jsonb NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    "adminNotes" text,
    "scheduledAt" timestamp without time zone,
    "isExecuted" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public."vendorRequests" OWNER TO fustan_user;

--
-- Name: vendorRequests_id_seq; Type: SEQUENCE; Schema: public; Owner: fustan_user
--

CREATE SEQUENCE public."vendorRequests_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."vendorRequests_id_seq" OWNER TO fustan_user;

--
-- Name: vendorRequests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: fustan_user
--

ALTER SEQUENCE public."vendorRequests_id_seq" OWNED BY public."vendorRequests".id;


--
-- Name: vendorReviews; Type: TABLE; Schema: public; Owner: fustan_user
--

CREATE TABLE public."vendorReviews" (
    id integer NOT NULL,
    "vendorId" integer NOT NULL,
    "customerId" integer NOT NULL,
    rating integer NOT NULL,
    comment text,
    "isVerifiedPurchase" boolean DEFAULT false,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public."vendorReviews" OWNER TO fustan_user;

--
-- Name: vendorReviews_id_seq; Type: SEQUENCE; Schema: public; Owner: fustan_user
--

CREATE SEQUENCE public."vendorReviews_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."vendorReviews_id_seq" OWNER TO fustan_user;

--
-- Name: vendorReviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: fustan_user
--

ALTER SEQUENCE public."vendorReviews_id_seq" OWNED BY public."vendorReviews".id;


--
-- Name: vendorWallets; Type: TABLE; Schema: public; Owner: fustan_user
--

CREATE TABLE public."vendorWallets" (
    id integer NOT NULL,
    "vendorId" integer NOT NULL,
    "availableBalance" double precision DEFAULT 0 NOT NULL,
    "pendingBalance" double precision DEFAULT 0 NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public."vendorWallets" OWNER TO fustan_user;

--
-- Name: vendorWallets_id_seq; Type: SEQUENCE; Schema: public; Owner: fustan_user
--

CREATE SEQUENCE public."vendorWallets_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."vendorWallets_id_seq" OWNER TO fustan_user;

--
-- Name: vendorWallets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: fustan_user
--

ALTER SEQUENCE public."vendorWallets_id_seq" OWNED BY public."vendorWallets".id;


--
-- Name: vendors; Type: TABLE; Schema: public; Owner: fustan_user
--

CREATE TABLE public.vendors (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    "storeNameAr" text,
    "storeNameEn" text,
    "storeSlug" text NOT NULL,
    "descriptionAr" text,
    "descriptionEn" text,
    logo text,
    banner text,
    "coverImage" text,
    email text NOT NULL,
    phone text,
    "addressAr" text,
    "addressEn" text,
    "cityAr" text,
    "cityEn" text,
    "countryAr" text,
    "countryEn" text,
    "zipCode" text,
    website text,
    "socialLinks" jsonb,
    gallery text[],
    "isVerified" boolean DEFAULT false,
    "isActive" boolean DEFAULT true,
    "commissionRate" double precision DEFAULT 15,
    rating double precision DEFAULT 0,
    "totalReviews" integer DEFAULT 0,
    "shippingCost" double precision DEFAULT 0 NOT NULL,
    "hasFreeShipping" boolean DEFAULT false NOT NULL,
    "freeShippingThreshold" double precision DEFAULT 0,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.vendors OWNER TO fustan_user;

--
-- Name: vendors_id_seq; Type: SEQUENCE; Schema: public; Owner: fustan_user
--

CREATE SEQUENCE public.vendors_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.vendors_id_seq OWNER TO fustan_user;

--
-- Name: vendors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: fustan_user
--

ALTER SEQUENCE public.vendors_id_seq OWNED BY public.vendors.id;


--
-- Name: walletTransactions; Type: TABLE; Schema: public; Owner: fustan_user
--

CREATE TABLE public."walletTransactions" (
    id integer NOT NULL,
    "walletId" integer NOT NULL,
    amount double precision NOT NULL,
    type text NOT NULL,
    status text DEFAULT 'completed'::text NOT NULL,
    description text,
    "relatedId" integer,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public."walletTransactions" OWNER TO fustan_user;

--
-- Name: walletTransactions_id_seq; Type: SEQUENCE; Schema: public; Owner: fustan_user
--

CREATE SEQUENCE public."walletTransactions_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."walletTransactions_id_seq" OWNER TO fustan_user;

--
-- Name: walletTransactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: fustan_user
--

ALTER SEQUENCE public."walletTransactions_id_seq" OWNED BY public."walletTransactions".id;


--
-- Name: wishlist; Type: TABLE; Schema: public; Owner: fustan_user
--

CREATE TABLE public.wishlist (
    id integer NOT NULL,
    "customerId" integer NOT NULL,
    "productId" integer NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.wishlist OWNER TO fustan_user;

--
-- Name: wishlistSettings; Type: TABLE; Schema: public; Owner: fustan_user
--

CREATE TABLE public."wishlistSettings" (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    "isPublic" boolean DEFAULT false NOT NULL,
    "shareToken" text,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public."wishlistSettings" OWNER TO fustan_user;

--
-- Name: wishlistSettings_id_seq; Type: SEQUENCE; Schema: public; Owner: fustan_user
--

CREATE SEQUENCE public."wishlistSettings_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."wishlistSettings_id_seq" OWNER TO fustan_user;

--
-- Name: wishlistSettings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: fustan_user
--

ALTER SEQUENCE public."wishlistSettings_id_seq" OWNED BY public."wishlistSettings".id;


--
-- Name: wishlist_id_seq; Type: SEQUENCE; Schema: public; Owner: fustan_user
--

CREATE SEQUENCE public.wishlist_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.wishlist_id_seq OWNER TO fustan_user;

--
-- Name: wishlist_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: fustan_user
--

ALTER SEQUENCE public.wishlist_id_seq OWNED BY public.wishlist.id;


--
-- Name: __drizzle_migrations id; Type: DEFAULT; Schema: drizzle; Owner: fustan_user
--

ALTER TABLE ONLY drizzle.__drizzle_migrations ALTER COLUMN id SET DEFAULT nextval('drizzle.__drizzle_migrations_id_seq'::regclass);


--
-- Name: aiPlans id; Type: DEFAULT; Schema: public; Owner: fustan_user
--

ALTER TABLE ONLY public."aiPlans" ALTER COLUMN id SET DEFAULT nextval('public."aiPlans_id_seq"'::regclass);


--
-- Name: cartItems id; Type: DEFAULT; Schema: public; Owner: fustan_user
--

ALTER TABLE ONLY public."cartItems" ALTER COLUMN id SET DEFAULT nextval('public."cartItems_id_seq"'::regclass);


--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: fustan_user
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: collections id; Type: DEFAULT; Schema: public; Owner: fustan_user
--

ALTER TABLE ONLY public.collections ALTER COLUMN id SET DEFAULT nextval('public.collections_id_seq'::regclass);


--
-- Name: contentItems id; Type: DEFAULT; Schema: public; Owner: fustan_user
--

ALTER TABLE ONLY public."contentItems" ALTER COLUMN id SET DEFAULT nextval('public."contentItems_id_seq"'::regclass);


--
-- Name: conversations id; Type: DEFAULT; Schema: public; Owner: fustan_user
--

ALTER TABLE ONLY public.conversations ALTER COLUMN id SET DEFAULT nextval('public.conversations_id_seq'::regclass);


--
-- Name: coupons id; Type: DEFAULT; Schema: public; Owner: fustan_user
--

ALTER TABLE ONLY public.coupons ALTER COLUMN id SET DEFAULT nextval('public.coupons_id_seq'::regclass);


--
-- Name: messages id; Type: DEFAULT; Schema: public; Owner: fustan_user
--

ALTER TABLE ONLY public.messages ALTER COLUMN id SET DEFAULT nextval('public.messages_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: fustan_user
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: offerItems id; Type: DEFAULT; Schema: public; Owner: fustan_user
--

ALTER TABLE ONLY public."offerItems" ALTER COLUMN id SET DEFAULT nextval('public."offerItems_id_seq"'::regclass);


--
-- Name: offers id; Type: DEFAULT; Schema: public; Owner: fustan_user
--

ALTER TABLE ONLY public.offers ALTER COLUMN id SET DEFAULT nextval('public.offers_id_seq'::regclass);


--
-- Name: orderItems id; Type: DEFAULT; Schema: public; Owner: fustan_user
--

ALTER TABLE ONLY public."orderItems" ALTER COLUMN id SET DEFAULT nextval('public."orderItems_id_seq"'::regclass);


--
-- Name: orders id; Type: DEFAULT; Schema: public; Owner: fustan_user
--

ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);


--
-- Name: pointsTransactions id; Type: DEFAULT; Schema: public; Owner: fustan_user
--

ALTER TABLE ONLY public."pointsTransactions" ALTER COLUMN id SET DEFAULT nextval('public."pointsTransactions_id_seq"'::regclass);


--
-- Name: productColors id; Type: DEFAULT; Schema: public; Owner: fustan_user
--

ALTER TABLE ONLY public."productColors" ALTER COLUMN id SET DEFAULT nextval('public."productColors_id_seq"'::regclass);


--
-- Name: products id; Type: DEFAULT; Schema: public; Owner: fustan_user
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- Name: reviews id; Type: DEFAULT; Schema: public; Owner: fustan_user
--

ALTER TABLE ONLY public.reviews ALTER COLUMN id SET DEFAULT nextval('public.reviews_id_seq'::regclass);


--
-- Name: shipping id; Type: DEFAULT; Schema: public; Owner: fustan_user
--

ALTER TABLE ONLY public.shipping ALTER COLUMN id SET DEFAULT nextval('public.shipping_id_seq'::regclass);


--
-- Name: storeReviews id; Type: DEFAULT; Schema: public; Owner: fustan_user
--

ALTER TABLE ONLY public."storeReviews" ALTER COLUMN id SET DEFAULT nextval('public."storeReviews_id_seq"'::regclass);


--
-- Name: userAiCredits id; Type: DEFAULT; Schema: public; Owner: fustan_user
--

ALTER TABLE ONLY public."userAiCredits" ALTER COLUMN id SET DEFAULT nextval('public."userAiCredits_id_seq"'::regclass);


--
-- Name: userPoints id; Type: DEFAULT; Schema: public; Owner: fustan_user
--

ALTER TABLE ONLY public."userPoints" ALTER COLUMN id SET DEFAULT nextval('public."userPoints_id_seq"'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: fustan_user
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: vendorPayouts id; Type: DEFAULT; Schema: public; Owner: fustan_user
--

ALTER TABLE ONLY public."vendorPayouts" ALTER COLUMN id SET DEFAULT nextval('public."vendorPayouts_id_seq"'::regclass);


--
-- Name: vendorRequests id; Type: DEFAULT; Schema: public; Owner: fustan_user
--

ALTER TABLE ONLY public."vendorRequests" ALTER COLUMN id SET DEFAULT nextval('public."vendorRequests_id_seq"'::regclass);


--
-- Name: vendorReviews id; Type: DEFAULT; Schema: public; Owner: fustan_user
--

ALTER TABLE ONLY public."vendorReviews" ALTER COLUMN id SET DEFAULT nextval('public."vendorReviews_id_seq"'::regclass);


--
-- Name: vendorWallets id; Type: DEFAULT; Schema: public; Owner: fustan_user
--

ALTER TABLE ONLY public."vendorWallets" ALTER COLUMN id SET DEFAULT nextval('public."vendorWallets_id_seq"'::regclass);


--
-- Name: vendors id; Type: DEFAULT; Schema: public; Owner: fustan_user
--

ALTER TABLE ONLY public.vendors ALTER COLUMN id SET DEFAULT nextval('public.vendors_id_seq'::regclass);


--
-- Name: walletTransactions id; Type: DEFAULT; Schema: public; Owner: fustan_user
--

ALTER TABLE ONLY public."walletTransactions" ALTER COLUMN id SET DEFAULT nextval('public."walletTransactions_id_seq"'::regclass);


--
-- Name: wishlist id; Type: DEFAULT; Schema: public; Owner: fustan_user
--

ALTER TABLE ONLY public.wishlist ALTER COLUMN id SET DEFAULT nextval('public.wishlist_id_seq'::regclass);


--
-- Name: wishlistSettings id; Type: DEFAULT; Schema: public; Owner: fustan_user
--

ALTER TABLE ONLY public."wishlistSettings" ALTER COLUMN id SET DEFAULT nextval('public."wishlistSettings_id_seq"'::regclass);


--
-- Data for Name: __drizzle_migrations; Type: TABLE DATA; Schema: drizzle; Owner: fustan_user
--

COPY drizzle.__drizzle_migrations (id, hash, created_at) FROM stdin;
\.


--
-- Data for Name: aiPlans; Type: TABLE DATA; Schema: public; Owner: fustan_user
--

COPY public."aiPlans" (id, "nameAr", "nameEn", "descriptionAr", "descriptionEn", price, credits, "durationDays", "isActive", "createdAt", "updatedAt") FROM stdin;
2	max	max	max	max	10	15	\N	t	2026-05-19 09:33:49.352	2026-05-19 14:29:59.172
1	free	free	free	free	0	5	\N	t	2026-05-16 17:42:25.217	2026-05-19 14:30:16.938
\.


--
-- Data for Name: aiTasks; Type: TABLE DATA; Schema: public; Owner: fustan_user
--

COPY public."aiTasks" (id, type, "targetId", status, "resultUrl", error, metadata, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: cartItems; Type: TABLE DATA; Schema: public; Owner: fustan_user
--

COPY public."cartItems" (id, "customerId", "productId", quantity, size, "addedAt", "updatedAt", "customMeasurements") FROM stdin;
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: fustan_user
--

COPY public.categories (id, "nameAr", "nameEn", slug, "descriptionAr", "descriptionEn", image, "parentId", "isActive", "displayOrder", "createdAt", "updatedAt", "aiBackgroundImage", "categoryBackgroundUrl", "categoryBackgroundPrompt") FROM stdin;
4	دولاب المستعمل	Used wardrobe	used-wardrobe	فاستين العملاء المستخدمة		https://res.cloudinary.com/dk3wwuy5d/image/upload/v1777796505/fustan-products/oepja4ymndx2h8bduipk.jpg	\N	t	0	2026-05-03 08:07:38.500456	2026-05-14 09:35:17.514	\N	https://res.cloudinary.com/dk3wwuy5d/image/upload/v1778751316/fustan-products/mbfy5oljnciash9slpm3.jpg	
3	فساتين غمرة	Traditional Henna	traditional-henna			https://res.cloudinary.com/dk3wwuy5d/image/upload/v1776267191/fustan-products/e7szatcsadw8higkoumo.jpg	\N	t	0	2026-03-07 18:54:14.297845	2026-05-16 12:18:17.832	\N	https://res.cloudinary.com/dk3wwuy5d/image/upload/v1778933897/fustan-products/br5jrfikhrcv5lndweqx.jpg	
2	فساتين سهرة	evening dresses	evening-dresses			https://res.cloudinary.com/dk3wwuy5d/image/upload/v1776266873/fustan-products/hnnboglazsw35xapauwd.jpg	\N	t	0	2026-03-07 18:36:12.369816	2026-05-14 07:52:32.206	\N	https://res.cloudinary.com/dk3wwuy5d/image/upload/v1778744369/fustan-products/rkpusd9kuvw70y5tx1cm.jpg	
1	فساتين زفاف	Wedding dress	arabic			https://res.cloudinary.com/dk3wwuy5d/image/upload/v1776254917/fustan-products/luj8n7ghqpbwqnlhikgw.jpg	\N	t	0	2026-03-02 06:16:12.568699	2026-05-14 07:54:18.479	\N	https://res.cloudinary.com/dk3wwuy5d/image/upload/v1778745257/fustan-products/xsqkvgjb3hrl98qdezld.jpg	
\.


--
-- Data for Name: collections; Type: TABLE DATA; Schema: public; Owner: fustan_user
--

COPY public.collections (id, "vendorId", "nameAr", "nameEn", slug, description, "coverImage", "categoryId", "isActive", "createdAt", "updatedAt") FROM stdin;
5	0	زفاف	w	w-1776342502750	\N	https://res.cloudinary.com/dk3wwuy5d/image/upload/v1776342502/fustan-products/m56akdhw9uewoy8vhu7e.jpg	1	t	2026-04-16 12:28:22.750588	2026-04-16 12:28:22.750588
6	0	Art	Art	art-1776344725915	\N	https://res.cloudinary.com/dk3wwuy5d/image/upload/v1776344724/fustan-products/lrfwxdi0m3zkso7xlwvk.jpg	1	t	2026-04-16 13:05:25.915961	2026-04-16 13:05:25.915961
\.


--
-- Data for Name: contentItems; Type: TABLE DATA; Schema: public; Owner: fustan_user
--

COPY public."contentItems" (id, type, data, "isActive", "displayOrder", "createdAt", "updatedAt") FROM stdin;
1	testimonial	{"avatar": "S", "nameAr": "سارة محمد", "nameEn": "Sarah Mohammed", "rating": 5, "roleAr": "الرياض", "roleEn": "Riyadh", "commentAr": "فستان رائع جداً، الخامة ممتازة والتفصيل دقيق. وصلني الطلب في وقت قياسي والتغليف كان فاخراً. شكراً فستان!", "commentEn": "Absolutely stunning dress, excellent fabric and precise tailoring. Arrived in record time and packaging was luxurious. Thanks Fustan!"}	t	1	2026-03-01 21:47:36.820036	2026-03-01 21:47:36.820036
2	testimonial	{"avatar": "A", "nameAr": "علياء أحمد", "nameEn": "Alia Ahmed", "rating": 5, "roleAr": "جدة", "roleEn": "Jeddah", "commentAr": "تجربة تسوق مميزة، الفستان كان أجمل من الصور والمقاس مضبوط تماماً.", "commentEn": "Amazing shopping experience, the dress was even more beautiful than the pictures and the fit was perfect."}	t	2	2026-03-01 21:47:36.820036	2026-03-01 21:47:36.820036
3	testimonial	{"avatar": "N", "nameAr": "نورة فهد", "nameEn": "Noura Fahad", "rating": 5, "roleAr": "الدمام", "roleEn": "Dammam", "commentAr": "خدمة العملاء جداً متعاونين، والفستان وصل بسرعة. أنصح بالتعامل معكم.", "commentEn": "Customer service was very helpful, and the dress arrived quickly. Highly recommend dealing with you."}	t	3	2026-03-01 21:47:36.820036	2026-03-01 21:47:36.820036
4	social_feed	{"link": "#", "imageUrl": ""}	t	1	2026-03-01 21:47:36.824272	2026-03-07 18:55:41.212
5	social_feed	{"link": "#", "imageUrl": ""}	t	2	2026-03-01 21:47:36.824272	2026-03-07 18:55:47.327
6	social_feed	{"link": "#", "imageUrl": ""}	t	3	2026-03-01 21:47:36.824272	2026-03-07 18:55:51.321
7	social_feed	{"link": "#", "imageUrl": ""}	t	4	2026-03-01 21:47:36.824272	2026-03-07 18:55:52.422
8	social_feed	{"link": "#", "imageUrl": ""}	t	5	2026-03-01 21:47:36.824272	2026-03-07 18:55:53.612
9	social_feed	{"link": "#", "imageUrl": ""}	t	6	2026-03-01 21:47:36.824272	2026-03-07 18:55:56.245
\.


--
-- Data for Name: conversations; Type: TABLE DATA; Schema: public; Owner: fustan_user
--

COPY public.conversations (id, "customerId", "vendorId", "lastMessageId", "createdAt", "updatedAt") FROM stdin;
1	5	3	7	2026-04-13 11:59:49.154	2026-04-13 12:04:21.527
2	7	5	8	2026-04-25 17:29:28.407	2026-04-25 17:29:28.421
\.


--
-- Data for Name: coupons; Type: TABLE DATA; Schema: public; Owner: fustan_user
--

COPY public.coupons (id, "vendorId", code, "discountPercent", "maxUses", "usedCount", "expiresAt", "isActive", "createdAt") FROM stdin;
1	3	LS	15	\N	0	\N	t	2026-03-07 17:50:18.238128
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: fustan_user
--

COPY public.messages (id, "conversationId", "senderId", "senderRole", content, "isRead", "createdAt") FROM stdin;
1	1	5	customer	يسعد مسساكم 	t	2026-04-13 11:59:49.169
2	1	4	vendor	اهلا وسهلا 	t	2026-04-13 12:00:18.91
3	1	4	vendor	كيف نقدر نخدمك 	t	2026-04-13 12:00:23.41
4	1	4	vendor	اهلا بك	t	2026-04-13 12:00:33.2
5	1	5	customer	هل متاحين الان 	t	2026-04-13 12:04:03.903
6	1	4	vendor	نعم	t	2026-04-13 12:04:11.875
7	1	4	vendor	نعم	t	2026-04-13 12:04:21.525
8	2	7	vendor	هلا 	f	2026-04-25 17:29:28.418
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: fustan_user
--

COPY public.notifications (id, "userId", type, title, message, "relatedId", "isRead", "createdAt") FROM stdin;
1	1	vendor_status	تمت الموافقة على حسابك ✅	مبروك! تم تفعيل حساب البائع الخاص بك. يمكنك الآن الدخول إلى لوحة التحكم.	1	t	2026-03-02 04:50:10.522615
2	2	vendor_registration	تسجيل بائع جديد	قام بائع جديد بالتسجيل: lamsa (lamsa@fustan.cloud)	3	f	2026-03-03 11:03:26.155494
3	2	vendor_registration	تسجيل بائع جديد	قام بائع جديد بالتسجيل: Lamsah (lamsah@fustan.cloud)	4	f	2026-03-03 11:38:43.926327
4	4	vendor_status	تمت الموافقة على حسابك ✅	مبروك! تم تفعيل حساب البائع الخاص بك. يمكنك الآن الدخول إلى لوحة التحكم.	3	f	2026-03-03 11:52:35.861664
5	3	vendor_status	تمت الموافقة على حسابك ✅	مبروك! تم تفعيل حساب البائع الخاص بك. يمكنك الآن الدخول إلى لوحة التحكم.	2	f	2026-03-03 11:52:37.104017
6	2	vendor_registration	تسجيل بائع جديد	قام بائع جديد بالتسجيل: fustan (ahmed11@fustan.com)	6	f	2026-03-15 12:32:01.430441
7	2	vendor_registration	تسجيل بائع جديد	قام بائع جديد بالتسجيل: fustan (ahmed12@fustan.com)	7	f	2026-03-15 12:32:54.056085
8	2	vendor_registration	تسجيل بائع جديد	قام بائع جديد بالتسجيل: fdgdfg (ahmed12154@fustan.com)	8	f	2026-03-15 12:34:05.540376
38	2	vendor_registration	تسجيل بائع جديد	قام بائع جديد بالتسجيل: fustan (ahmed159@fustan.com)	22	f	2026-05-13 00:33:20.99195
10	2	vendor_registration	تسجيل بائع جديد	قام بائع جديد بالتسجيل: fustan (ahmed17899@fustan.com)	10	f	2026-03-17 20:01:31.540469
11	10	vendor_status	تمت الموافقة على حسابك ✅	مبروك! تم تفعيل حساب البائع الخاص بك. يمكنك الآن الدخول إلى لوحة التحكم.	7	f	2026-03-17 20:01:42.958108
12	6	vendor_status	تم رفض طلبك ❌	عذراً، لم يتم قبول طلبك للانضمام كبائع. يرجى التواصل مع الإدارة لمزيد من التفاصيل.	4	f	2026-04-12 09:07:02.178305
13	8	vendor_status	تم رفض طلبك ❌	عذراً، لم يتم قبول طلبك للانضمام كبائع. يرجى التواصل مع الإدارة لمزيد من التفاصيل.	6	f	2026-04-12 09:07:03.080987
14	4	new_message	رسالة جديدة	يسعد مسساكم 	1	f	2026-04-13 11:59:49.185016
15	5	new_message	رسالة جديدة	اهلا وسهلا 	1	f	2026-04-13 12:00:18.914859
16	5	new_message	رسالة جديدة	كيف نقدر نخدمك 	1	f	2026-04-13 12:00:23.414347
17	5	new_message	رسالة جديدة	اهلا بك	1	f	2026-04-13 12:00:33.20523
18	4	new_message	رسالة جديدة	هل متاحين الان 	1	f	2026-04-13 12:04:03.90716
19	5	new_message	رسالة جديدة	نعم	1	f	2026-04-13 12:04:11.87874
20	5	new_message	رسالة جديدة	نعم	1	f	2026-04-13 12:04:21.528956
21	2	vendor_registration	تسجيل بائع جديد	قام بائع جديد بالتسجيل: Art (artart@gmail.com)	11	f	2026-04-16 13:00:25.651438
22	11	vendor_status	تمت الموافقة على حسابك ✅	مبروك! تم تفعيل حساب البائع الخاص بك. يمكنك الآن الدخول إلى لوحة التحكم.	8	f	2026-04-16 13:02:39.276792
9	7	vendor_status	تمت الموافقة على حسابك ✅	مبروك! تم تفعيل حساب البائع الخاص بك. يمكنك الآن الدخول إلى لوحة التحكم.	5	t	2026-03-15 12:35:23.816306
23	7	new_message	رسالة جديدة	هلا 	2	t	2026-04-25 17:29:28.42735
24	2	vendor_registration	تسجيل بائع جديد	قام بائع جديد بالتسجيل: fus (ahmed14@fustan.com)	15	f	2026-05-03 16:59:05.38349
25	15	vendor_status	تمت الموافقة على حسابك ✅	مبروك! تم تفعيل حساب البائع الخاص بك. يمكنك الآن الدخول إلى لوحة التحكم.	10	f	2026-05-03 16:59:36.68225
26	2	vendor_registration	تسجيل بائع جديد	قام بائع جديد بالتسجيل: fustan (ahmedyass6979@gmail.com)	16	f	2026-05-07 15:43:27.962466
27	2	vendor_registration	تسجيل بائع جديد	قام بائع جديد بالتسجيل: fua s  (ahmed1214@fustan.com)	17	f	2026-05-07 15:44:55.259485
28	2	vendor_registration	تسجيل بائع جديد	قام بائع جديد بالتسجيل: kjkj (ahmed12145@fustan.com)	18	f	2026-05-07 16:06:55.03598
29	2	vendor_registration	تسجيل بائع جديد	قام بائع جديد بالتسجيل: kjkj (ahmed121456@fustan.com)	19	f	2026-05-07 16:13:50.770178
30	2	vendor_registration	تسجيل بائع جديد	قام بائع جديد بالتسجيل: دار الجازي  (ull0532809336@gmail.com)	20	f	2026-05-07 16:46:22.628123
31	20	vendor_status	تمت الموافقة على حسابك ✅	مبروك! تم تفعيل حساب البائع الخاص بك. يمكنك الآن الدخول إلى لوحة التحكم.	15	f	2026-05-07 17:07:32.335171
32	2	vendor_registration	تسجيل بائع جديد	قام بائع جديد بالتسجيل: asas (ahmed1445@fustan.com)	21	f	2026-05-07 19:22:02.362047
33	21	vendor_status	تم رفض طلبك ❌	عذراً، لم يتم قبول طلبك للانضمام كبائع. يرجى التواصل مع الإدارة لمزيد من التفاصيل.	16	f	2026-05-09 10:56:42.167393
34	19	vendor_status	تم رفض طلبك ❌	عذراً، لم يتم قبول طلبك للانضمام كبائع. يرجى التواصل مع الإدارة لمزيد من التفاصيل.	14	f	2026-05-09 10:56:44.850279
35	18	vendor_status	تم رفض طلبك ❌	عذراً، لم يتم قبول طلبك للانضمام كبائع. يرجى التواصل مع الإدارة لمزيد من التفاصيل.	13	f	2026-05-09 10:56:46.766703
36	17	vendor_status	تم رفض طلبك ❌	عذراً، لم يتم قبول طلبك للانضمام كبائع. يرجى التواصل مع الإدارة لمزيد من التفاصيل.	12	f	2026-05-09 10:56:48.196763
37	16	vendor_status	تم رفض طلبك ❌	عذراً، لم يتم قبول طلبك للانضمام كبائع. يرجى التواصل مع الإدارة لمزيد من التفاصيل.	11	f	2026-05-09 10:56:50.739722
39	22	vendor_status	تمت الموافقة على حسابك ✅	مبروك! تم تفعيل حساب البائع الخاص بك. يمكنك الآن الدخول إلى لوحة التحكم.	17	f	2026-05-13 07:39:48.490879
\.


--
-- Data for Name: offerItems; Type: TABLE DATA; Schema: public; Owner: fustan_user
--

COPY public."offerItems" (id, "offerId", "productId", "createdAt") FROM stdin;
\.


--
-- Data for Name: offers; Type: TABLE DATA; Schema: public; Owner: fustan_user
--

COPY public.offers (id, "vendorId", "nameAr", "nameEn", "discountPercent", "startDate", "endDate", "usageLimit", "minQuantity", "usedCount", "isActive", "createdAt", "updatedAt") FROM stdin;
1	3	عرض عيد الفطر	eaid	10	2026-03-01 00:00:00	2026-03-31 00:00:00	\N	1	0	t	2026-03-07 17:49:45.056505	2026-03-07 17:49:45.056505
\.


--
-- Data for Name: orderItems; Type: TABLE DATA; Schema: public; Owner: fustan_user
--

COPY public."orderItems" (id, "orderId", "productId", "vendorId", quantity, price, total, size, color, "createdAt", "customMeasurements") FROM stdin;
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: fustan_user
--

COPY public.orders (id, "orderNumber", "customerId", "vendorId", status, subtotal, "shippingCost", tax, discount, commission, total, "shippingAddress", "billingAddress", "paymentMethod", "paymentStatus", "stripePaymentId", "trackingNumber", notes, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: pointsTransactions; Type: TABLE DATA; Schema: public; Owner: fustan_user
--

COPY public."pointsTransactions" (id, "userId", amount, type, description, "createdAt") FROM stdin;
\.


--
-- Data for Name: productColors; Type: TABLE DATA; Schema: public; Owner: fustan_user
--

COPY public."productColors" (id, "productId", "colorName", "colorCode", images, "createdAt") FROM stdin;
14	36		#f9f6f6	[]	2026-05-14 07:27:16.460244
15	37		#e63333	[]	2026-05-14 07:43:25.279762
17	39		#f6eaea	[]	2026-05-14 12:12:13.72201
18	40		#000000	[]	2026-05-16 12:26:57.286249
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: fustan_user
--

COPY public.products (id, "vendorId", "collectionId", "categoryId", "brandId", "nameAr", "nameEn", slug, "descriptionAr", "descriptionEn", sizes, "shortDescription", "vendorPrice", "vendorOriginalPrice", price, "originalPrice", discount, sku, stock, images, specifications, "cutType", "bodyShape", impression, occasion, silhouette, rating, "reviewCount", "isActive", "isFeatured", "aiQualifiedImage", tags, "createdAt", "updatedAt", availability, condition, "usageCount", "rentPrice", "salePrice", "usagePrices") FROM stdin;
9	5	\N	2	\N	بيبييبيب	تنتن	--1777139917987	هذا الفستان الرائع من بيبييبيب مثالي للمناسبات الراقية. يتميز بتصميم فريد يجمع بين الأناقة والراحة.	This stunning تنتن dress is perfect for elegant occasions. It features a unique design that combines style and comfort.	[{"size": "2", "quantity": 10}, {"size": "4", "quantity": 10}]	\N	1125	1250	1237.5	1375	10	تنت	20	["https://res.cloudinary.com/dk3wwuy5d/image/upload/v1777139916/fustan-products/uis2fasbt1quwxvc89ez.jpg"]	\N		مثالي لجميع الأجسام (خاصة المثلث المقلوب)	كلاسيكي وراقي: يجمع بين الأناقة والراحة في الحركة.	كافة أنواع الحفلات (داخلية أو خارجية)	A-Line	0	0	t	f	https://res.cloudinary.com/dk3wwuy5d/image/upload/v1777139917/fustan-products/odyvsvtnu4c5jdpa4klz.jpg	["نتن"]	2026-04-25 17:58:37.991527	2026-04-25 17:58:37.991527	sale	new	0	0	1375	\N
21	3	\N	1	\N	فستان زفاف	wedding dress	wedding-dress-1777977816550	هذا الفستان الرائع من فستان زفاف هو الخيار الأمثل لإطلالة متميزة.	This beautiful wedding dress dress is the perfect choice for a standout look.	[{"size": "36", "quantity": 1}]	\N	\N	\N	4400	4400	0	FST-V003-C01-NVW8	1	["https://res.cloudinary.com/dk3wwuy5d/image/upload/v1777977815/fustan-products/pnelkqyl56x8v5mcym2o.jpg", "https://res.cloudinary.com/dk3wwuy5d/image/upload/v1777977815/fustan-products/gdjqdwfd8ehzd8orfg34.jpg", "https://res.cloudinary.com/dk3wwuy5d/image/upload/v1777977815/fustan-products/btmyymxsap5q1yunt0lr.jpg"]	\N					\N	0	0	t	f	\N	\N	2026-05-05 10:43:36.551123	2026-05-05 10:43:36.551123	sale	new	0	\N	\N	\N
36	3	\N	1	\N	فستان زفاف مفتوح	wedding	wedding-1778743636460	في ليلة العمر، يتجلى الحلم في هذا الفستان الذي ينسج قصة حب خالدة. كل خيط يروي إشراقة فريدة، وكل حركة ترسم سحراً لا يُنسى. ارتدي فخامة اللحظة وكوني أيقونة الجمال التي طالما حلمتِ بها، بلمسة من الرقي المطلق.	Walk into your dream. This enchanting wedding gown, a cascade of ethereal fabrics and shimmering light, tells a timeless love story. Every delicate detail is crafted to capture your radiant essence, ensuring you embody unforgettable elegance on your most treasured day. A masterpiece of grace.	[{"size": "12", "quantity": 5}]	\N	\N	\N	11000	11000	0	FST-V003-C01-8EYT	5	["https://res.cloudinary.com/dk3wwuy5d/image/upload/v1778743636/fustan-ai-bg-removal/q5ncbwsqchazkcfu5vzy.jpg", "https://res.cloudinary.com/dk3wwuy5d/image/upload/v1778743649/fustan-ai-bg-removal/z7rcdmdklscziaqbfcsk.jpg", "https://res.cloudinary.com/dk3wwuy5d/image/upload/v1778743651/fustan-ai-bg-removal/wamg6grb5nvh9vh7lwme.jpg", "https://res.cloudinary.com/dk3wwuy5d/image/upload/v1778743653/fustan-ai-bg-removal/x1kcb7wqmmeekufzz8pf.jpg"]	\N					\N	0	0	t	f	\N	\N	2026-05-14 07:27:16.460244	2026-05-14 07:27:34.21	sale	new	0	\N	\N	\N
37	3	\N	1	\N	فستان سهره	eve	eve-1778744605279	فستان السهرة هذا، تحفة فنية تُنسج بخيوط الأناقة والرقي. يتهادى قماشه بنعومة كالحلم، ليحتضن قوامك بسحر لا يُضاهى. كل تفصيلة فيه تروي حكاية تألق لا تبهت، ليليق بكل سهرة تخطينها، وليجعلك نجمة تضيء فضاء الليل ببريق لا يُمحى.	Introducing Eve, a gown that doesn't just adorn, but transforms. Its luxurious fabric cascades with a whispered grace, embracing your form with an unparalleled elegance. Each stitch tells a story of allure, designed for the woman who commands attention without uttering a word. Step into Eve and become the evening's most captivating dream.	[{"size": "8", "quantity": 1}]	\N	\N	\N	550	550	0	FST-V003-C01-PDWG	1	["https://res.cloudinary.com/dk3wwuy5d/image/upload/v1778744605/fustan-ai-bg-removal/vuldd6dqtyqbwhdfo8g1.jpg", "https://res.cloudinary.com/dk3wwuy5d/image/upload/v1778744609/fustan-ai-bg-removal/lmnlyotoi2wynr5jrm4m.jpg", "https://res.cloudinary.com/dk3wwuy5d/image/upload/v1778744612/fustan-ai-bg-removal/xwf2kpyrpci3oqygnnu3.jpg"]	\N					\N	0	0	t	f	\N	\N	2026-05-14 07:43:25.279762	2026-05-14 07:43:36.195	sale	new	0	\N	\N	\N
39	3	\N	1	\N	فستان زفاف	wedd	wedd-1778760733719	في ليلة العمر، حيث تلتقي الأحلام بالواقع، ينسج فستان زفاف Fustan لكِ قصة لا تُنسى. تتهادى خيوطه الفاخرة كهمس النسيم، وتتلألأ تفاصيله الساحرة ببريق النجوم. ارتدي تحفة فنية تعانق أنوثتك، لتتوجي ملكة متوجة بالجمال والرقي، تاركةً بصمة من الفتنة الخالدة في كل نظرة وخطوة.	Unveil your dream in this Fustan wedding gown. An ethereal masterpiece, its luxurious fabric whispers tales of timeless romance and unparalleled grace. Feel its luminous embrace cascade around you, capturing every gaze and the essence of your radiant beauty. Become the unforgettable vision, weaving your love story into every shimmering thread of your cherished day.	[{"size": "10", "quantity": 0}]	\N	\N	\N	11000	11000	0	FST-V003-C01-0DVR	0	["https://res.cloudinary.com/dk3wwuy5d/image/upload/v1778760733/fustan-ai-bg-removal/s5hprwsxlrfubqismejf.jpg", "https://res.cloudinary.com/dk3wwuy5d/image/upload/v1778760736/fustan-ai-bg-removal/sh9fuqkba5rikspzzxgp.jpg", "https://res.cloudinary.com/dk3wwuy5d/image/upload/v1778760739/fustan-ai-bg-removal/nsmp7twjp7qmfh2i1mug.jpg"]	\N					\N	0	0	t	f	\N	\N	2026-05-14 12:12:13.72201	2026-05-14 12:12:21.862	sale	new	0	\N	\N	\N
40	3	\N	3	\N	فستان غمرة جنوبية	henna dress	henna-dress-1778934417283			[{"size": "4", "quantity": 1}]	\N	\N	\N	880.0000000000001	880.0000000000001	0	FST-V003-C03-DGQ7	1	["https://res.cloudinary.com/dk3wwuy5d/image/upload/v1778934417/fustan-ai-bg-removal/wu4yxoqfqva9ja3t6yta.jpg", "https://res.cloudinary.com/dk3wwuy5d/image/upload/v1778934420/fustan-ai-bg-removal/qy3q68pu7yijpdwglsta.jpg"]	\N					\N	0	0	t	f	\N	\N	2026-05-16 12:26:57.286249	2026-05-16 12:27:03.261	sale	new	0	\N	\N	\N
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: fustan_user
--

COPY public.reviews (id, "productId", "customerId", rating, title, comment, images, "isVerifiedPurchase", helpful, unhelpful, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: shipping; Type: TABLE DATA; Schema: public; Owner: fustan_user
--

COPY public.shipping (id, "productId", "vendorId", "shippingCost", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: storeReviews; Type: TABLE DATA; Schema: public; Owner: fustan_user
--

COPY public."storeReviews" (id, "customerId", "guestName", city, rating, comment, "isApproved", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: userAiCredits; Type: TABLE DATA; Schema: public; Owner: fustan_user
--

COPY public."userAiCredits" (id, "userId", "totalCredits", "usedCredits", "remainingCredits", "expiresAt", "updatedAt", "planId") FROM stdin;
2	23	3	3	0	\N	2026-05-19 10:43:37.029	1
3	2	3	0	3	\N	2026-05-19 13:41:59.673	1
1	14	53	4	49	2027-05-19 09:44:09.382	2026-05-19 17:25:38.075	2
4	13	5	0	5	\N	2026-05-21 16:00:13.624	1
5	24	5	0	5	\N	2026-06-10 11:08:47.71	1
\.


--
-- Data for Name: userPoints; Type: TABLE DATA; Schema: public; Owner: fustan_user
--

COPY public."userPoints" (id, "userId", points, "updatedAt") FROM stdin;
1	24	0	2026-06-10 11:08:47.681667
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: fustan_user
--

COPY public.users (id, "openId", name, email, phone, whatsapp, address, password, "loginMethod", role, avatar, measurements, "createdAt", "updatedAt", "lastSignedIn", "isEmailVerified", otp, "otpExpiresAt") FROM stdin;
2	admin_1772408039679	Admin User	admin@fustan.com	\N	\N	\N	0eed5b9507c72d087b799a9d6d4b6a24:14ef17d811cb89c92ad04d9342cce43c3055efbd6e525d34e39db6d77ff1c01236374d8feef07bf6b4312c258001c28640003e3307123314231219aff35b607f	email	admin	\N	\N	2026-03-01 23:33:59.680981	2026-03-01 23:33:59.680981	2026-03-01 23:33:59.680981	f	\N	\N
20	user_1778172381246_f1nwh6kta	دار الجاز ي	ull0532809336@gmail.com	0597779004	\N	\N	e7645d0138ef194c8016bff904502fcb:4c08839383d636bc92cfab65addbe5c7c3ae5aba62a23ea36ce13307d6d22d9deb95aca799fad09ee54b6451c30878c378a19086ff3f342a8eeaac989f74e143	email	vendor	\N	\N	2026-05-07 16:46:21.247183	2026-05-07 16:46:21.247183	2026-05-07 16:46:21.247	f	636855	2026-05-07 17:01:21.247
24	google_103174715404709074673	Ahmed Krishna	ahmedkrishna11@gmail.com	\N	\N	\N		google	customer	\N	\N	2026-06-10 11:08:14.556502	2026-06-10 11:08:14.556502	2026-06-10 11:08:14.548	f	\N	\N
4	user_1772537923912_or21vimlo	اسلام فؤاد	lamsah@fustan.cloud	+966538956813	\N	\N	be27ebed4df9ae45208fd623440bf038:e6c8d4aab0953abc2c5a6362bd1d8881a82b7d0553f9771746bea021641e4f2388377405cf4b31a89de3ec5d061254e664ddf42150c9a3e3a555ec2fb4d67e55	email	vendor	\N	\N	2026-03-03 11:38:43.912713	2026-03-07 18:14:22.083	2026-03-03 11:38:43.913	f	\N	\N
5	user_1773274707525_vs0exjmzp	eslam	ahmed.r.marey@outlook.com	0538956813	\N		dc52ff4e5feb6221b7e2a956ed38c94a:5c37ded1a1cf49ee2783aea1a54446a5c2b000059e504df58e2b0634f7f7f31094846ad9d5d31c5abf7fa8da4c261ce26d33769e958600eff95d258fe467dd0c	email	customer	\N	\N	2026-03-12 00:18:27.525501	2026-03-12 00:18:27.525501	2026-03-12 00:18:27.526	f	\N	\N
6	user_1773577921406_r6v67t03l	Ahmed	ahmed11@fustan.com	010000000000	\N	\N	da332ad5e0369efd4610d0733e04ece2:bd5bd3c04eef531b03f15f1d350e562d8a3a284276fef1b477cbb73999124c25729e50fb24f54eefcd3fabacf548f42f0bd2b47298d4349a450e231a463d0e26	email	vendor	\N	\N	2026-03-15 12:32:01.409055	2026-03-15 12:32:01.409055	2026-03-15 12:32:01.41	f	\N	\N
7	user_1773577974051_xv8dnqcec	Ahmed	ahmed12@fustan.com	010000000000	\N	\N	a9b71ff5124376a6fc0dd121eaf6f6cf:9247f7ea9588bf7626110201c9cad89c8ae18d25fa7bf2b755322a07cc6b7c42e6cbd271be3ea5f5265ae97941d63a0c46c64d07375f321cec05cc09f0423450	email	vendor	\N	\N	2026-03-15 12:32:54.051692	2026-03-15 12:32:54.051692	2026-03-15 12:32:54.052	f	\N	\N
8	user_1773578045534_fbk1s6q47	Ahmed	ahmed12154@fustan.com	010555454545	\N	\N	dcdf76a8b081e3f67059c8595d4c5765:bc7cb21a571a320a91eaf73227920ce41bad3eacafacedff5bd4e7f960094f2ba712388861abef339eae84560c1d66786d3847617c89d2ec8fd1e0c86ca52f66	email	vendor	\N	\N	2026-03-15 12:34:05.535377	2026-03-15 12:34:05.535377	2026-03-15 12:34:05.535	f	\N	\N
9	user_1773777456519_f5ybwck5d	احمد ياسر صالح 	ahmed15@fustan.com	010000000000	\N		beb203bf6a4e0d6a47e9ec793c5ccf7a:c4607ae141facfede4087a177aafdbf08da1b09dec9e2f26dbb214b9acbec896467817be8f0f93c86daef329d514bd4f2e4b76407d7b7e7e957e9a68736e0f03	email	customer	\N	\N	2026-03-17 19:57:36.520863	2026-03-17 19:57:36.520863	2026-03-17 19:57:36.524	f	\N	\N
12	user_1777125744391_uqw2o98xm	ahmed	ahmedyass@gmail.com	0100100100100	\N		7de9dbda4547bdfd262c93e4b8638e79:4e583ec41ad7be879e9445e9d054eed37dbec19fc2328716f607cb4d2d5343455231c346ec5b918fd4ae64064e220f20cb688efd96e88d3e033576cd0976e02b	email	customer	\N	\N	2026-04-25 14:02:24.392604	2026-04-25 14:02:24.392604	2026-04-25 14:02:24.393	f	\N	\N
13	user_1777752364445_fkc63n984	Eso	eso.mo.mosa@gmail.com	0538956813	\N		d63e35f5d7a8af6bc75c6083aa1a7642:3907b0cfcc3639183ba97fd744823427940c46d3b0eefe91c98616f1e6fa86c04cd2ee5d6d2e41fe4cb36fba3dbac561dc828c3eb02a3e53d6f482064e087f87	email	customer	\N	\N	2026-05-02 20:06:04.44696	2026-05-02 20:06:04.44696	2026-05-02 20:06:04.448	f	\N	\N
15	user_1777827545374_r5ji4rttm	hpl] 	ahmed14@fustan.com	01091678935	\N	\N	73d2a6bb577f585a35a9d9b851e67afc:63806b0a066852c5679a7a014cc6f3e5781b7e45c5b6d4101b986210a1d2ede679d58787131bab4914f842f3dc542c1a5d867682940eb342d4cbc8a0d7ec7f3c	email	vendor	\N	\N	2026-05-03 16:59:05.375346	2026-05-03 16:59:05.375346	2026-05-03 16:59:05.376	f	\N	\N
16	user_1778168607118_q597bxw8f	ahmed	ahmedyass6979@gmail.com	01091678935	\N	\N	b5a024322ba749d6f1a0b550e9460b34:401e2973e9b2501be3b506be2601f46d8238412536f257e5574e00bfe5c6a23a2dbfaf4c0c6ead6ae991f24698c6d8cf31ea4c6d00bf938471032c395b074896	email	vendor	\N	\N	2026-05-07 15:43:27.119525	2026-05-07 15:43:27.119525	2026-05-07 15:43:27.12	f	127095	2026-05-07 15:58:27.12
18	user_1778170014132_mxj9ry4hy	klklk	ahmed12145@fustan.com	0211521	\N	\N	8bc5d52654b5ebe746c3e13fe260465e:e89d31d0994a6d81e09f5753ee68ec9957ecee024d6c52e5646cc8ae67a7886379a2d8eb81b49ae6905b3facd06cc33aa0b05d5229e41d68db65cf41253d11c5	email	vendor	\N	\N	2026-05-07 16:06:54.133479	2026-05-07 16:06:54.133479	2026-05-07 16:06:54.134	f	894482	2026-05-07 16:21:54.134
19	user_1778170428043_n7osy9mdf	klklk	ahmed121456@fustan.com	0211521	\N	\N	0275a9cb0918ab7d39fcb5d2a8846d23:216f02e37270288b274915648529fe2f8c2aa8e258292599e2fcceebfa89568f58c3dd396d5b9c740515940741cf1a2c4a2e7a8245ecc867e46e9b7af354d8e1	email	vendor	\N	\N	2026-05-07 16:13:48.04396	2026-05-07 16:13:48.04396	2026-05-07 16:13:48.044	f	623330	2026-05-07 16:28:48.044
21	user_1778181721424_b42prk56e	adminn	ahmed1445@fustan.com	0555215845	\N	\N	26933245a0ffcdbb4e72f6a8a64a5e1b:4ce4c2bdd8158e639dbfcb4d41c529d57b8e2ade46e09e2b23f8628ab51d9e77697ad4b1c6243965e95cd2526c60f05d27db2200e8978f3a69723495a3876558	email	vendor	\N	\N	2026-05-07 19:22:01.42611	2026-05-07 19:22:01.42611	2026-05-07 19:22:01.427	f	373374	2026-05-07 19:37:01.426
23	google_113891687085061374089	ahmed yasser	ahmedyasser6978@gmail.com	\N	\N	\N		google	customer	\N	\N	2026-05-19 10:40:32.0184	2026-05-19 10:40:32.0184	2026-05-19 10:40:32.017	f	\N	\N
14	google_112175047227473704373	ahmed yasser	ahmedyasser697@gmail.com	\N	\N	\N		google	customer	\N	\N	2026-05-03 16:20:11.442442	2026-05-03 16:20:11.442442	2026-05-19 17:24:30.727	f	383533	2026-05-07 15:38:03.692
\.


--
-- Data for Name: vendorPayouts; Type: TABLE DATA; Schema: public; Owner: fustan_user
--

COPY public."vendorPayouts" (id, "vendorId", amount, status, period, "stripePayoutId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: vendorRequests; Type: TABLE DATA; Schema: public; Owner: fustan_user
--

COPY public."vendorRequests" (id, "vendorId", type, data, status, "adminNotes", "scheduledAt", "isExecuted", "createdAt", "updatedAt") FROM stdin;
2	5	collection_request	{"nameAr": "dfs", "nameEn": "dfsdf", "imageUrl": "https://res.cloudinary.com/dk3wwuy5d/image/upload/v1773773767/fustan-products/rbjy5yq61oequ2qt8tfm.jpg", "descriptionAr": "dsf", "descriptionEn": "sdfsdf"}	approved	\N	\N	f	2026-03-17 18:56:08.383144	2026-03-17 19:28:45.533
5	5	category_request	{"nameAr": "jhjjk", "nameEn": "klkjl", "imageUrl": "https://res.cloudinary.com/dk3wwuy5d/image/upload/v1773774800/fustan-products/jbnykiio6cwopsmur1hv.jpg", "descriptionAr": "jklj", "descriptionEn": "lkjjkl"}	approved	\N	\N	f	2026-03-17 19:13:21.639877	2026-03-17 19:28:48.124
6	5	collection_request	{"nameAr": "l;kl;", "nameEn": "lk;lk", "imageUrl": "https://res.cloudinary.com/dk3wwuy5d/image/upload/v1773774826/fustan-products/njoxf42lkhwjbfrivoz4.jpg", "categoryId": "2", "descriptionAr": "l;kl;", "descriptionEn": "lk;lk;"}	approved	\N	\N	f	2026-03-17 19:13:47.94717	2026-03-17 19:28:49.379
7	7	collection_request	{"nameAr": ",lk", "nameEn": "jkjk", "imageUrl": "https://res.cloudinary.com/dk3wwuy5d/image/upload/v1773777842/fustan-products/geql4bwrzxbs4xupx3vd.jpg", "categoryId": "2", "descriptionAr": "45454", "descriptionEn": "lkl;"}	approved	\N	\N	f	2026-03-17 20:04:03.505669	2026-03-17 20:04:10.389
8	7	collection_request	{"nameAr": "لبيل", "nameEn": "لابا", "imageUrl": "https://res.cloudinary.com/dk3wwuy5d/image/upload/v1773781567/fustan-products/kz24kjvxmxt2mhwdde61.jpg", "categoryId": "1", "descriptionAr": "البلا", "descriptionEn": "لبالبا"}	approved	\N	\N	t	2026-03-17 21:06:08.206365	2026-03-17 21:06:16.508
\.


--
-- Data for Name: vendorReviews; Type: TABLE DATA; Schema: public; Owner: fustan_user
--

COPY public."vendorReviews" (id, "vendorId", "customerId", rating, comment, "isVerifiedPurchase", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: vendorWallets; Type: TABLE DATA; Schema: public; Owner: fustan_user
--

COPY public."vendorWallets" (id, "vendorId", "availableBalance", "pendingBalance", "updatedAt") FROM stdin;
1	3	0	0	2026-03-04 13:16:11.830372
2	5	0	0	2026-03-17 12:30:17.453823
\.


--
-- Data for Name: vendors; Type: TABLE DATA; Schema: public; Owner: fustan_user
--

COPY public.vendors (id, "userId", status, "storeNameAr", "storeNameEn", "storeSlug", "descriptionAr", "descriptionEn", logo, banner, "coverImage", email, phone, "addressAr", "addressEn", "cityAr", "cityEn", "countryAr", "countryEn", "zipCode", website, "socialLinks", gallery, "isVerified", "isActive", "commissionRate", rating, "totalReviews", "shippingCost", "hasFreeShipping", "freeShippingThreshold", "createdAt", "updatedAt") FROM stdin;
10	15	approved	fus	fus	fus-15	New vendor store	New vendor store	\N	\N	\N	ahmed14@fustan.com	01091678935	\N	\N	abha	\N	\N	\N	\N	\N	\N	\N	t	t	0	0	0	0	f	0	2026-05-03 16:59:05.375346	2026-05-07 19:13:03.804
16	21	rejected	aasa	asas	asas-21	New vendor store	New vendor store	\N	\N	\N	ahmed1445@fustan.com	0555215845	\N	\N	aasas	\N	\N	\N	\N	\N	\N	\N	f	f	15	0	0	0	f	0	2026-05-07 19:22:01.42611	2026-05-09 10:56:42.156
14	19	rejected	kjkjk	kjkj	kjkj-19	New vendor store	New vendor store	\N	\N	\N	ahmed121456@fustan.com	0211521	\N	\N	,;l;llk	\N	\N	\N	\N	\N	\N	\N	f	f	15	0	0	0	f	0	2026-05-07 16:13:48.04396	2026-05-09 10:56:44.848
13	18	rejected	kjkjk	kjkj	kjkj-18	New vendor store	New vendor store	\N	\N	\N	ahmed12145@fustan.com	0211521	\N	\N	,;l;llk	\N	\N	\N	\N	\N	\N	\N	f	f	15	0	0	0	f	0	2026-05-07 16:06:54.133479	2026-05-09 10:56:46.765
3	4	approved	لمســـــــــــــــــة	Lamsah	lamsah-4	متجرنا حلو	lamsah ok	https://res.cloudinary.com/dk3wwuy5d/image/upload/v1772537923/fustan-products/gvbblsw1cixmjoqbmdoz.jpg	https://res.cloudinary.com/dk3wwuy5d/image/upload/v1772907263/fustan-products/rx65yi3r20pqnphps6kg.jpg	\N	lamsah@fustan.cloud	+966538956813			جدة						{"tiktok": "", "twitter": "", "facebook": "", "whatsapp": "", "instagram": ""}	\N	t	t	10	0	0	30	f	0	2026-03-03 11:38:43.912713	2026-03-07 18:14:24.389
5	7	approved	fustan	fustan	fustan-7	New vendor store	New vendor store	\N	\N	\N	ahmed12@fustan.com	010000000000	\N	\N	فستان 	\N	\N	\N	\N	\N	\N	\N	t	t	10	0	0	0	f	0	2026-03-15 12:32:54.051692	2026-03-15 12:35:23.812
4	6	rejected	fustan	fustan	fustan-6	dfd	fggf	\N	\N	\N	ahmed11@fustan.com	010000000000	\N	\N	فستان 	\N	\N	\N	\N	\N	\N	\N	f	f	10	0	0	0	f	0	2026-03-15 12:32:01.409055	2026-04-12 09:07:02.167
6	8	rejected	sdf	fdgdfg	fdgdfg-8	fgfdg	fdgg	\N	\N	\N	ahmed12154@fustan.com	010555454545	\N	\N	fgd	\N	\N	\N	\N	\N	\N	\N	f	f	10	0	0	0	f	0	2026-03-15 12:34:05.535377	2026-04-12 09:07:03.079
9	2	approved	دعم فستان	Fustan Support	fustan-support	الدعم الفني للمنصة	Platform Technical Support	https://placehold.co/400x400/e91e63/ffffff?text=FS	\N	\N	support@fustan.com	0000000000	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	t	15	0	0	0	f	0	2026-05-02 08:47:27.307	2026-05-02 08:47:27.307
11	16	rejected	fustan	fustan	fustan-16	New vendor store	New vendor store	\N	\N	\N	ahmedyass6979@gmail.com	01091678935	\N	\N	gadha	\N	\N	\N	\N	\N	\N	\N	f	f	15	0	0	0	f	0	2026-05-07 15:43:27.119525	2026-05-09 10:56:50.738
15	20	approved	بوتيك فساتين 	دار الجازي 	--20	دار الجازي 	New vendor store	https://res.cloudinary.com/dk3wwuy5d/image/upload/v1778172380/fustan-products/olchwtbs56qvwiy60bk0.jpg	\N	\N	ull0532809336@gmail.com	0597779004	\N	\N	جدة 	\N	\N	\N	\N	\N	\N	\N	t	t	15	0	0	0	f	0	2026-05-07 16:46:21.247183	2026-05-07 17:07:32.331
\.


--
-- Data for Name: walletTransactions; Type: TABLE DATA; Schema: public; Owner: fustan_user
--

COPY public."walletTransactions" (id, "walletId", amount, type, status, description, "relatedId", "createdAt") FROM stdin;
\.


--
-- Data for Name: wishlist; Type: TABLE DATA; Schema: public; Owner: fustan_user
--

COPY public.wishlist (id, "customerId", "productId", "createdAt") FROM stdin;
\.


--
-- Data for Name: wishlistSettings; Type: TABLE DATA; Schema: public; Owner: fustan_user
--

COPY public."wishlistSettings" (id, "userId", "isPublic", "shareToken", "updatedAt") FROM stdin;
1	24	f	BWewwaXLMu	2026-06-10 11:08:42.874038
\.


--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE SET; Schema: drizzle; Owner: fustan_user
--

SELECT pg_catalog.setval('drizzle.__drizzle_migrations_id_seq', 1, false);


--
-- Name: aiPlans_id_seq; Type: SEQUENCE SET; Schema: public; Owner: fustan_user
--

SELECT pg_catalog.setval('public."aiPlans_id_seq"', 2, true);


--
-- Name: cartItems_id_seq; Type: SEQUENCE SET; Schema: public; Owner: fustan_user
--

SELECT pg_catalog.setval('public."cartItems_id_seq"', 1, false);


--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: fustan_user
--

SELECT pg_catalog.setval('public.categories_id_seq', 4, true);


--
-- Name: collections_id_seq; Type: SEQUENCE SET; Schema: public; Owner: fustan_user
--

SELECT pg_catalog.setval('public.collections_id_seq', 6, true);


--
-- Name: contentItems_id_seq; Type: SEQUENCE SET; Schema: public; Owner: fustan_user
--

SELECT pg_catalog.setval('public."contentItems_id_seq"', 9, true);


--
-- Name: conversations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: fustan_user
--

SELECT pg_catalog.setval('public.conversations_id_seq', 2, true);


--
-- Name: coupons_id_seq; Type: SEQUENCE SET; Schema: public; Owner: fustan_user
--

SELECT pg_catalog.setval('public.coupons_id_seq', 1, true);


--
-- Name: messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: fustan_user
--

SELECT pg_catalog.setval('public.messages_id_seq', 8, true);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: fustan_user
--

SELECT pg_catalog.setval('public.notifications_id_seq', 39, true);


--
-- Name: offerItems_id_seq; Type: SEQUENCE SET; Schema: public; Owner: fustan_user
--

SELECT pg_catalog.setval('public."offerItems_id_seq"', 1, true);


--
-- Name: offers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: fustan_user
--

SELECT pg_catalog.setval('public.offers_id_seq', 1, true);


--
-- Name: orderItems_id_seq; Type: SEQUENCE SET; Schema: public; Owner: fustan_user
--

SELECT pg_catalog.setval('public."orderItems_id_seq"', 1, false);


--
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: fustan_user
--

SELECT pg_catalog.setval('public.orders_id_seq', 1, false);


--
-- Name: pointsTransactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: fustan_user
--

SELECT pg_catalog.setval('public."pointsTransactions_id_seq"', 1, false);


--
-- Name: productColors_id_seq; Type: SEQUENCE SET; Schema: public; Owner: fustan_user
--

SELECT pg_catalog.setval('public."productColors_id_seq"', 18, true);


--
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: fustan_user
--

SELECT pg_catalog.setval('public.products_id_seq', 40, true);


--
-- Name: reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: fustan_user
--

SELECT pg_catalog.setval('public.reviews_id_seq', 1, false);


--
-- Name: shipping_id_seq; Type: SEQUENCE SET; Schema: public; Owner: fustan_user
--

SELECT pg_catalog.setval('public.shipping_id_seq', 1, false);


--
-- Name: storeReviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: fustan_user
--

SELECT pg_catalog.setval('public."storeReviews_id_seq"', 1, false);


--
-- Name: userAiCredits_id_seq; Type: SEQUENCE SET; Schema: public; Owner: fustan_user
--

SELECT pg_catalog.setval('public."userAiCredits_id_seq"', 5, true);


--
-- Name: userPoints_id_seq; Type: SEQUENCE SET; Schema: public; Owner: fustan_user
--

SELECT pg_catalog.setval('public."userPoints_id_seq"', 1, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: fustan_user
--

SELECT pg_catalog.setval('public.users_id_seq', 24, true);


--
-- Name: vendorPayouts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: fustan_user
--

SELECT pg_catalog.setval('public."vendorPayouts_id_seq"', 1, false);


--
-- Name: vendorRequests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: fustan_user
--

SELECT pg_catalog.setval('public."vendorRequests_id_seq"', 8, true);


--
-- Name: vendorReviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: fustan_user
--

SELECT pg_catalog.setval('public."vendorReviews_id_seq"', 1, false);


--
-- Name: vendorWallets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: fustan_user
--

SELECT pg_catalog.setval('public."vendorWallets_id_seq"', 2, true);


--
-- Name: vendors_id_seq; Type: SEQUENCE SET; Schema: public; Owner: fustan_user
--

SELECT pg_catalog.setval('public.vendors_id_seq', 17, true);


--
-- Name: walletTransactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: fustan_user
--

SELECT pg_catalog.setval('public."walletTransactions_id_seq"', 1, false);


--
-- Name: wishlistSettings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: fustan_user
--

SELECT pg_catalog.setval('public."wishlistSettings_id_seq"', 1, true);


--
-- Name: wishlist_id_seq; Type: SEQUENCE SET; Schema: public; Owner: fustan_user
--

SELECT pg_catalog.setval('public.wishlist_id_seq', 1, false);


--
-- Name: __drizzle_migrations __drizzle_migrations_pkey; Type: CONSTRAINT; Schema: drizzle; Owner: fustan_user
--

ALTER TABLE ONLY drizzle.__drizzle_migrations
    ADD CONSTRAINT __drizzle_migrations_pkey PRIMARY KEY (id);


--
-- Name: aiPlans aiPlans_pkey; Type: CONSTRAINT; Schema: public; Owner: fustan_user
--

ALTER TABLE ONLY public."aiPlans"
    ADD CONSTRAINT "aiPlans_pkey" PRIMARY KEY (id);


--
-- Name: aiTasks aiTasks_pkey; Type: CONSTRAINT; Schema: public; Owner: fustan_user
--

ALTER TABLE ONLY public."aiTasks"
    ADD CONSTRAINT "aiTasks_pkey" PRIMARY KEY (id);


--
-- Name: cartItems cartItems_pkey; Type: CONSTRAINT; Schema: public; Owner: fustan_user
--

ALTER TABLE ONLY public."cartItems"
    ADD CONSTRAINT "cartItems_pkey" PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: fustan_user
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: categories categories_slug_unique; Type: CONSTRAINT; Schema: public; Owner: fustan_user
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_slug_unique UNIQUE (slug);


--
-- Name: collections collections_pkey; Type: CONSTRAINT; Schema: public; Owner: fustan_user
--

ALTER TABLE ONLY public.collections
    ADD CONSTRAINT collections_pkey PRIMARY KEY (id);


--
-- Name: contentItems contentItems_pkey; Type: CONSTRAINT; Schema: public; Owner: fustan_user
--

ALTER TABLE ONLY public."contentItems"
    ADD CONSTRAINT "contentItems_pkey" PRIMARY KEY (id);


--
-- Name: conversations conversations_pkey; Type: CONSTRAINT; Schema: public; Owner: fustan_user
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_pkey PRIMARY KEY (id);


--
-- Name: coupons coupons_code_unique; Type: CONSTRAINT; Schema: public; Owner: fustan_user
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_code_unique UNIQUE (code);


--
-- Name: coupons coupons_pkey; Type: CONSTRAINT; Schema: public; Owner: fustan_user
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: fustan_user
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: fustan_user
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: offerItems offerItems_pkey; Type: CONSTRAINT; Schema: public; Owner: fustan_user
--

ALTER TABLE ONLY public."offerItems"
    ADD CONSTRAINT "offerItems_pkey" PRIMARY KEY (id);


--
-- Name: offers offers_pkey; Type: CONSTRAINT; Schema: public; Owner: fustan_user
--

ALTER TABLE ONLY public.offers
    ADD CONSTRAINT offers_pkey PRIMARY KEY (id);


--
-- Name: orderItems orderItems_pkey; Type: CONSTRAINT; Schema: public; Owner: fustan_user
--

ALTER TABLE ONLY public."orderItems"
    ADD CONSTRAINT "orderItems_pkey" PRIMARY KEY (id);


--
-- Name: orders orders_orderNumber_unique; Type: CONSTRAINT; Schema: public; Owner: fustan_user
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "orders_orderNumber_unique" UNIQUE ("orderNumber");


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: fustan_user
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: pointsTransactions pointsTransactions_pkey; Type: CONSTRAINT; Schema: public; Owner: fustan_user
--

ALTER TABLE ONLY public."pointsTransactions"
    ADD CONSTRAINT "pointsTransactions_pkey" PRIMARY KEY (id);


--
-- Name: productColors productColors_pkey; Type: CONSTRAINT; Schema: public; Owner: fustan_user
--

ALTER TABLE ONLY public."productColors"
    ADD CONSTRAINT "productColors_pkey" PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: fustan_user
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: fustan_user
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: shipping shipping_pkey; Type: CONSTRAINT; Schema: public; Owner: fustan_user
--

ALTER TABLE ONLY public.shipping
    ADD CONSTRAINT shipping_pkey PRIMARY KEY (id);


--
-- Name: storeReviews storeReviews_pkey; Type: CONSTRAINT; Schema: public; Owner: fustan_user
--

ALTER TABLE ONLY public."storeReviews"
    ADD CONSTRAINT "storeReviews_pkey" PRIMARY KEY (id);


--
-- Name: userAiCredits userAiCredits_pkey; Type: CONSTRAINT; Schema: public; Owner: fustan_user
--

ALTER TABLE ONLY public."userAiCredits"
    ADD CONSTRAINT "userAiCredits_pkey" PRIMARY KEY (id);


--
-- Name: userAiCredits userAiCredits_userId_unique; Type: CONSTRAINT; Schema: public; Owner: fustan_user
--

ALTER TABLE ONLY public."userAiCredits"
    ADD CONSTRAINT "userAiCredits_userId_unique" UNIQUE ("userId");


--
-- Name: userPoints userPoints_pkey; Type: CONSTRAINT; Schema: public; Owner: fustan_user
--

ALTER TABLE ONLY public."userPoints"
    ADD CONSTRAINT "userPoints_pkey" PRIMARY KEY (id);


--
-- Name: userPoints userPoints_userId_unique; Type: CONSTRAINT; Schema: public; Owner: fustan_user
--

ALTER TABLE ONLY public."userPoints"
    ADD CONSTRAINT "userPoints_userId_unique" UNIQUE ("userId");


--
-- Name: users users_openId_unique; Type: CONSTRAINT; Schema: public; Owner: fustan_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "users_openId_unique" UNIQUE ("openId");


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: fustan_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: vendorPayouts vendorPayouts_pkey; Type: CONSTRAINT; Schema: public; Owner: fustan_user
--

ALTER TABLE ONLY public."vendorPayouts"
    ADD CONSTRAINT "vendorPayouts_pkey" PRIMARY KEY (id);


--
-- Name: vendorRequests vendorRequests_pkey; Type: CONSTRAINT; Schema: public; Owner: fustan_user
--

ALTER TABLE ONLY public."vendorRequests"
    ADD CONSTRAINT "vendorRequests_pkey" PRIMARY KEY (id);


--
-- Name: vendorReviews vendorReviews_pkey; Type: CONSTRAINT; Schema: public; Owner: fustan_user
--

ALTER TABLE ONLY public."vendorReviews"
    ADD CONSTRAINT "vendorReviews_pkey" PRIMARY KEY (id);


--
-- Name: vendorWallets vendorWallets_pkey; Type: CONSTRAINT; Schema: public; Owner: fustan_user
--

ALTER TABLE ONLY public."vendorWallets"
    ADD CONSTRAINT "vendorWallets_pkey" PRIMARY KEY (id);


--
-- Name: vendorWallets vendorWallets_vendorId_unique; Type: CONSTRAINT; Schema: public; Owner: fustan_user
--

ALTER TABLE ONLY public."vendorWallets"
    ADD CONSTRAINT "vendorWallets_vendorId_unique" UNIQUE ("vendorId");


--
-- Name: vendors vendors_pkey; Type: CONSTRAINT; Schema: public; Owner: fustan_user
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_pkey PRIMARY KEY (id);


--
-- Name: vendors vendors_storeSlug_unique; Type: CONSTRAINT; Schema: public; Owner: fustan_user
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT "vendors_storeSlug_unique" UNIQUE ("storeSlug");


--
-- Name: walletTransactions walletTransactions_pkey; Type: CONSTRAINT; Schema: public; Owner: fustan_user
--

ALTER TABLE ONLY public."walletTransactions"
    ADD CONSTRAINT "walletTransactions_pkey" PRIMARY KEY (id);


--
-- Name: wishlistSettings wishlistSettings_pkey; Type: CONSTRAINT; Schema: public; Owner: fustan_user
--

ALTER TABLE ONLY public."wishlistSettings"
    ADD CONSTRAINT "wishlistSettings_pkey" PRIMARY KEY (id);


--
-- Name: wishlistSettings wishlistSettings_shareToken_unique; Type: CONSTRAINT; Schema: public; Owner: fustan_user
--

ALTER TABLE ONLY public."wishlistSettings"
    ADD CONSTRAINT "wishlistSettings_shareToken_unique" UNIQUE ("shareToken");


--
-- Name: wishlistSettings wishlistSettings_userId_unique; Type: CONSTRAINT; Schema: public; Owner: fustan_user
--

ALTER TABLE ONLY public."wishlistSettings"
    ADD CONSTRAINT "wishlistSettings_userId_unique" UNIQUE ("userId");


--
-- Name: wishlist wishlist_pkey; Type: CONSTRAINT; Schema: public; Owner: fustan_user
--

ALTER TABLE ONLY public.wishlist
    ADD CONSTRAINT wishlist_pkey PRIMARY KEY (id);


--
-- Name: aiTasks_status_idx; Type: INDEX; Schema: public; Owner: fustan_user
--

CREATE INDEX "aiTasks_status_idx" ON public."aiTasks" USING btree (status);


--
-- Name: aiTasks_targetId_idx; Type: INDEX; Schema: public; Owner: fustan_user
--

CREATE INDEX "aiTasks_targetId_idx" ON public."aiTasks" USING btree ("targetId");


--
-- Name: aiTasks_type_idx; Type: INDEX; Schema: public; Owner: fustan_user
--

CREATE INDEX "aiTasks_type_idx" ON public."aiTasks" USING btree (type);


--
-- Name: cartItems_customerId_idx; Type: INDEX; Schema: public; Owner: fustan_user
--

CREATE INDEX "cartItems_customerId_idx" ON public."cartItems" USING btree ("customerId");


--
-- Name: cartItems_productId_idx; Type: INDEX; Schema: public; Owner: fustan_user
--

CREATE INDEX "cartItems_productId_idx" ON public."cartItems" USING btree ("productId");


--
-- Name: collections_categoryId_idx; Type: INDEX; Schema: public; Owner: fustan_user
--

CREATE INDEX "collections_categoryId_idx" ON public.collections USING btree ("categoryId");


--
-- Name: collections_vendorId_idx; Type: INDEX; Schema: public; Owner: fustan_user
--

CREATE INDEX "collections_vendorId_idx" ON public.collections USING btree ("vendorId");


--
-- Name: collections_vendor_slug_idx; Type: INDEX; Schema: public; Owner: fustan_user
--

CREATE UNIQUE INDEX collections_vendor_slug_idx ON public.collections USING btree ("vendorId", slug);


--
-- Name: contentItems_type_idx; Type: INDEX; Schema: public; Owner: fustan_user
--

CREATE INDEX "contentItems_type_idx" ON public."contentItems" USING btree (type);


--
-- Name: conversations_customerId_idx; Type: INDEX; Schema: public; Owner: fustan_user
--

CREATE INDEX "conversations_customerId_idx" ON public.conversations USING btree ("customerId");


--
-- Name: conversations_unique_idx; Type: INDEX; Schema: public; Owner: fustan_user
--

CREATE UNIQUE INDEX conversations_unique_idx ON public.conversations USING btree ("customerId", "vendorId");


--
-- Name: conversations_vendorId_idx; Type: INDEX; Schema: public; Owner: fustan_user
--

CREATE INDEX "conversations_vendorId_idx" ON public.conversations USING btree ("vendorId");


--
-- Name: coupons_code_idx; Type: INDEX; Schema: public; Owner: fustan_user
--

CREATE UNIQUE INDEX coupons_code_idx ON public.coupons USING btree (code);


--
-- Name: coupons_vendorId_idx; Type: INDEX; Schema: public; Owner: fustan_user
--

CREATE INDEX "coupons_vendorId_idx" ON public.coupons USING btree ("vendorId");


--
-- Name: messages_conversationId_idx; Type: INDEX; Schema: public; Owner: fustan_user
--

CREATE INDEX "messages_conversationId_idx" ON public.messages USING btree ("conversationId");


--
-- Name: notifications_userId_idx; Type: INDEX; Schema: public; Owner: fustan_user
--

CREATE INDEX "notifications_userId_idx" ON public.notifications USING btree ("userId");


--
-- Name: offerItems_offerId_idx; Type: INDEX; Schema: public; Owner: fustan_user
--

CREATE INDEX "offerItems_offerId_idx" ON public."offerItems" USING btree ("offerId");


--
-- Name: offerItems_productId_idx; Type: INDEX; Schema: public; Owner: fustan_user
--

CREATE INDEX "offerItems_productId_idx" ON public."offerItems" USING btree ("productId");


--
-- Name: offerItems_unique_idx; Type: INDEX; Schema: public; Owner: fustan_user
--

CREATE UNIQUE INDEX "offerItems_unique_idx" ON public."offerItems" USING btree ("offerId", "productId");


--
-- Name: offers_vendorId_idx; Type: INDEX; Schema: public; Owner: fustan_user
--

CREATE INDEX "offers_vendorId_idx" ON public.offers USING btree ("vendorId");


--
-- Name: orderItems_orderId_idx; Type: INDEX; Schema: public; Owner: fustan_user
--

CREATE INDEX "orderItems_orderId_idx" ON public."orderItems" USING btree ("orderId");


--
-- Name: orderItems_productId_idx; Type: INDEX; Schema: public; Owner: fustan_user
--

CREATE INDEX "orderItems_productId_idx" ON public."orderItems" USING btree ("productId");


--
-- Name: orderItems_vendorId_idx; Type: INDEX; Schema: public; Owner: fustan_user
--

CREATE INDEX "orderItems_vendorId_idx" ON public."orderItems" USING btree ("vendorId");


--
-- Name: orders_customerId_idx; Type: INDEX; Schema: public; Owner: fustan_user
--

CREATE INDEX "orders_customerId_idx" ON public.orders USING btree ("customerId");


--
-- Name: orders_orderNumber_idx; Type: INDEX; Schema: public; Owner: fustan_user
--

CREATE UNIQUE INDEX "orders_orderNumber_idx" ON public.orders USING btree ("orderNumber");


--
-- Name: orders_vendorId_idx; Type: INDEX; Schema: public; Owner: fustan_user
--

CREATE INDEX "orders_vendorId_idx" ON public.orders USING btree ("vendorId");


--
-- Name: pointsTransactions_userId_idx; Type: INDEX; Schema: public; Owner: fustan_user
--

CREATE INDEX "pointsTransactions_userId_idx" ON public."pointsTransactions" USING btree ("userId");


--
-- Name: productColors_productId_idx; Type: INDEX; Schema: public; Owner: fustan_user
--

CREATE INDEX "productColors_productId_idx" ON public."productColors" USING btree ("productId");


--
-- Name: products_categoryId_idx; Type: INDEX; Schema: public; Owner: fustan_user
--

CREATE INDEX "products_categoryId_idx" ON public.products USING btree ("categoryId");


--
-- Name: products_slug_idx; Type: INDEX; Schema: public; Owner: fustan_user
--

CREATE UNIQUE INDEX products_slug_idx ON public.products USING btree (slug);


--
-- Name: products_vendorId_idx; Type: INDEX; Schema: public; Owner: fustan_user
--

CREATE INDEX "products_vendorId_idx" ON public.products USING btree ("vendorId");


--
-- Name: reviews_customerId_idx; Type: INDEX; Schema: public; Owner: fustan_user
--

CREATE INDEX "reviews_customerId_idx" ON public.reviews USING btree ("customerId");


--
-- Name: reviews_productId_idx; Type: INDEX; Schema: public; Owner: fustan_user
--

CREATE INDEX "reviews_productId_idx" ON public.reviews USING btree ("productId");


--
-- Name: shipping_productId_idx; Type: INDEX; Schema: public; Owner: fustan_user
--

CREATE UNIQUE INDEX "shipping_productId_idx" ON public.shipping USING btree ("productId");


--
-- Name: shipping_vendorId_idx; Type: INDEX; Schema: public; Owner: fustan_user
--

CREATE INDEX "shipping_vendorId_idx" ON public.shipping USING btree ("vendorId");


--
-- Name: storeReviews_customerId_idx; Type: INDEX; Schema: public; Owner: fustan_user
--

CREATE INDEX "storeReviews_customerId_idx" ON public."storeReviews" USING btree ("customerId");


--
-- Name: userAiCredits_userId_idx; Type: INDEX; Schema: public; Owner: fustan_user
--

CREATE INDEX "userAiCredits_userId_idx" ON public."userAiCredits" USING btree ("userId");


--
-- Name: userPoints_userId_idx; Type: INDEX; Schema: public; Owner: fustan_user
--

CREATE INDEX "userPoints_userId_idx" ON public."userPoints" USING btree ("userId");


--
-- Name: vendorPayouts_vendorId_idx; Type: INDEX; Schema: public; Owner: fustan_user
--

CREATE INDEX "vendorPayouts_vendorId_idx" ON public."vendorPayouts" USING btree ("vendorId");


--
-- Name: vendorRequests_status_idx; Type: INDEX; Schema: public; Owner: fustan_user
--

CREATE INDEX "vendorRequests_status_idx" ON public."vendorRequests" USING btree (status);


--
-- Name: vendorRequests_vendorId_idx; Type: INDEX; Schema: public; Owner: fustan_user
--

CREATE INDEX "vendorRequests_vendorId_idx" ON public."vendorRequests" USING btree ("vendorId");


--
-- Name: vendorReviews_customerId_idx; Type: INDEX; Schema: public; Owner: fustan_user
--

CREATE INDEX "vendorReviews_customerId_idx" ON public."vendorReviews" USING btree ("customerId");


--
-- Name: vendorReviews_vendorId_idx; Type: INDEX; Schema: public; Owner: fustan_user
--

CREATE INDEX "vendorReviews_vendorId_idx" ON public."vendorReviews" USING btree ("vendorId");


--
-- Name: vendorWallets_vendorId_idx; Type: INDEX; Schema: public; Owner: fustan_user
--

CREATE INDEX "vendorWallets_vendorId_idx" ON public."vendorWallets" USING btree ("vendorId");


--
-- Name: vendors_storeSlug_idx; Type: INDEX; Schema: public; Owner: fustan_user
--

CREATE UNIQUE INDEX "vendors_storeSlug_idx" ON public.vendors USING btree ("storeSlug");


--
-- Name: vendors_userId_idx; Type: INDEX; Schema: public; Owner: fustan_user
--

CREATE UNIQUE INDEX "vendors_userId_idx" ON public.vendors USING btree ("userId");


--
-- Name: walletTransactions_walletId_idx; Type: INDEX; Schema: public; Owner: fustan_user
--

CREATE INDEX "walletTransactions_walletId_idx" ON public."walletTransactions" USING btree ("walletId");


--
-- Name: wishlistSettings_userId_idx; Type: INDEX; Schema: public; Owner: fustan_user
--

CREATE INDEX "wishlistSettings_userId_idx" ON public."wishlistSettings" USING btree ("userId");


--
-- Name: wishlist_customerId_idx; Type: INDEX; Schema: public; Owner: fustan_user
--

CREATE INDEX "wishlist_customerId_idx" ON public.wishlist USING btree ("customerId");


--
-- Name: wishlist_productId_idx; Type: INDEX; Schema: public; Owner: fustan_user
--

CREATE INDEX "wishlist_productId_idx" ON public.wishlist USING btree ("productId");


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT ALL ON SCHEMA public TO fustan_user;


--
-- PostgreSQL database dump complete
--

\unrestrict RGBLzaGiffLK73pHqJp5eb4LSqUeicSz63ArzckqDRtjCy9BrOB6JWHM3TEKNgz

