# Kingstop Fanclub

**The ultimate classmate ranking, rating, and social hub — by the minion.**

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Getting Started](#getting-started)
4. [Pages & Modules](#pages--modules)
5. [User Roles & Permissions](#user-roles--permissions)
6. [Technology Stack](#technology-stack)

---

## Overview

Kingstop Fanclub is an interactive web platform where users can upload classmate profiles, create tier lists, rate individuals across multiple dimensions, ship pairings, vote in polls, and maintain personalised profile shrines — all within a vibrant, community-driven experience.

New users must register and receive admin approval before gaining full access to the platform.

---

## Features

| Feature | Description |
|---|---|
| **Image Gallery** | Upload and manage classmate photos with categories and tags |
| **Tier Lists** | Drag-and-drop tier list builder (S through F) with public sharing |
| **Ratings** | Rate classmates on IQ, EQ, Sex Appeal, and Character Design (scored out of 40) |
| **Ship-O-Meter** | Calculate compatibility between two classmates and view shipping history |
| **The Judgement Quiz** | Personality-style quiz with classmate-based outcomes |
| **Crowd Verdicts (Polls)** | Create, vote on, and view results of community polls |
| **Shrine Wall** | Dedicated profile pages with Pinterest-style mood boards, bios, and custom headers |
| **Leaderboard** | Top-scoring ships, public tier list history, and community rankings |
| **Venn Diagrams** | Build custom Venn diagrams placing classmates into overlapping categories |
| **Classifications** | Tag and classify classmates into custom categories |
| **Comments** | Threaded commenting available across ships, tier lists, profiles, and leaderboard entries |
| **Real-time Presence** | See who else is online and active on the platform |

---

## Getting Started

### 1. Create an Account

Navigate to the **Sign Up** page and register with your email and a username. You will receive a verification email — click the link to confirm your account.

### 2. Await Approval

After verifying your email, your account enters a **pending approval** state. An administrator must approve your account before you can access the platform's features.

### 3. Explore

Once approved, you have full access to all modules listed above. Use the navigation cards on the home page to jump between features.

---

## Pages & Modules

### Home (`/`)
The landing page with animated navigation cards linking to every major feature.

### Upload Classmates (`/gallery`)
Upload photos and assign names to classmate profiles. Organise them with custom categories. These profiles are used across tier lists, ratings, ships, and the shrine wall.

### Make Tier List (`/tier-list`)
Build drag-and-drop tier lists ranking classmates from **S** (best) to **F** (worst). Tier lists can be saved privately or published for the community to view on the leaderboard.

### Classify (`/classifications`)
Create and manage categories, then assign classmates to them for quick filtering across the platform.

### Rate & Rank (`/ratings`)
Rate each classmate on four dimensions:
- **Sex Appeal** (0–10)
- **IQ** (0–10)
- **EQ** (0–10)
- **Character Design** (0–10)

Total scores are calculated out of 40 and feed into the leaderboard.

### Ship-O-Meter (`/ship-o-meter`)
Select two classmates to calculate a compatibility score. View the full history of all ships created by the community, complete with timestamps and comments.

### The Judgement (`/judgement-quiz`)
A quiz that matches your responses to a classmate profile — find out which classmate you are most like.

### Crowd Verdicts (`/polls`)
Create polls with custom questions and multiple-choice options. Share polls via invite links and reveal results when ready. Editors can be added to collaborate on poll creation.

### Shrine Wall (`/profiles`)
Every uploaded classmate gets a dedicated profile shrine featuring:
- A customisable gradient header
- Profile picture and bio
- Pinterest-style mood board with pinned images
- Community comments

### Leaderboard (`/leaderboard`)
Two tabs:
- **Top Ships** — The highest-scoring ship pairings of all time, with images and compatibility scores
- **Tier List History** — A chronological log of all public tier lists, showing who created them and when

Both sections support threaded comments. Admins can remove entries.

### Venn Diagrams (`/venn-diagram`)
Create custom Venn diagrams with labelled circles and place classmate images into overlapping regions.

---

## User Roles & Permissions

| Role | Capabilities |
|---|---|
| **User** | Access all features, create content, comment, vote |
| **Admin** | All user capabilities, plus: approve/reject new users, delete users, manage categories, remove leaderboard entries, access the full analytics dashboard with detailed activity logs |

### Admin Dashboard (`/admin`)

Administrators have access to a comprehensive dashboard with:
- **User Management** — Approve pending accounts, assign roles, delete users, and view per-user activity timelines
- **Activity Feed** — A human-readable log of every action taken on the platform (page visits, ratings, ships, edits, searches, and more) with expandable detail panels showing device, browser, and network context
- **Analytics & Insights** — Activity sparklines, action breakdowns, and usage trend charts
- **Category Management** — Create, edit, and delete classification categories

---

## Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui components
- **Animations**: Framer Motion
- **State Management**: TanStack React Query
- **Backend**: Lovable Cloud (authentication, database, file storage, edge functions)
- **Real-time**: WebSocket-based presence and live data updates

---

## Support

For questions, issues, or feature requests, contact the platform administrator directly.

---

*"The universe is a cruel, uncaring void. The key to being happy isn't a search for meaning; it's to keep yourself busy with unimportant nonsense, and eventually you'll be dead."*
