# Culinary Compass

I want you to build a professional, production-ready Recipe & Meal Organizer Web Application using modern best practices. This project should have a clean architecture, responsive UI, secure authentication, and a scalable database.

Tech Stack

Frontend

React (Vite)

TypeScript

Tailwind CSS

shadcn/ui

React Router

TanStack Query

React Hook Form

Framer Motion

Lucide Icons

Backend

Supabase

Database

Supabase PostgreSQL

Supabase Authentication

Supabase Storage

Row Level Security (RLS)

Project Goal

Create a complete Recipe & Meal Organizer where users can:

Create an account

Save recipes

Organize recipes into categories

Plan meals for the week

Automatically generate shopping lists

Save favorite recipes

Upload recipe images

Manage their profile

The application should look modern, premium, and professional.

Authentication

Implement Supabase Authentication with:

Sign Up

Login

Email Verification

Forgot Password

Reset Password

Logout

Protected Routes

Each user must only be able to access their own data.

Dashboard

After login display:

Welcome message

Total Recipes

Favorite Recipes Count

Weekly Meal Plan Summary

Shopping List Progress

Recently Added Recipes

Quick Action Cards

Include charts and attractive statistics.

Recipe Management

Users should be able to:

Create recipes

Edit recipes

Delete recipes

View recipe details

Upload recipe images

Add ingredients

Add cooking instructions

Set cooking time

Set servings

Set difficulty level

Add notes

Recipe Categories

Provide default categories:

Breakfast

Lunch

Dinner

Snacks

Desserts

Vegan

Vegetarian

High Protein

Low Carb

Allow users to create custom categories.

Search & Filters

Allow users to:

Search recipes

Filter by category

Filter by cooking time

Filter by difficulty

Sort by newest

Sort by oldest

Sort alphabetically

Favorite Recipes

Users should be able to:

Add recipes to favorites

Remove favorites

View all favorite recipes

Weekly Meal Planner

Create a calendar-based meal planner.

For every day:

Breakfast

Lunch

Dinner

Users can assign recipes using drag-and-drop or simple selection.

Shopping List Generator

Automatically generate a shopping list from all selected meals.

Allow users to:

Mark items as purchased

Edit quantities

Delete items

Add custom grocery items

Clear completed items

User Profile

Allow users to:

Update profile

Upload profile photo

Change password

Delete account

Notifications

Use toast notifications for:

Login

Logout

Recipe Added

Recipe Updated

Recipe Deleted

Shopping List Generated

Errors

Database Design (Supabase)

Create normalized tables with proper foreign keys.

Tables:

profiles

categories

recipes

ingredients

meal_plans

shopping_lists

shopping_items

favorites

Each table should include:

UUID primary key

created_at

updated_at

Create relationships using foreign keys.

Enable Row Level Security (RLS).

Write policies so users can only view, insert, update, and delete their own records.

Supabase Storage

Create a storage bucket for recipe images.

Allow authenticated users to upload and replace images.

UI Requirements

The UI should be premium and modern.

Requirements:

Beautiful landing page

Responsive on desktop, tablet, and mobile

Light Mode

Dark Mode

Glassmorphism cards

Smooth animations

Gradient backgrounds

Loading skeletons

Empty states

Error pages

Attractive dashboard

Consistent spacing

Professional typography

Accessible components

Folder Structure

Organize the project with reusable components.

Suggested structure:

components

pages

layouts

hooks

services

utils

lib

contexts

types

assets

Use clean coding standards.

Code Quality

TypeScript everywhere

Reusable components

Modular architecture

Clean folder structure

Proper error handling

Loading states

Form validation

Optimized queries

Secure authentication

Production-ready code

Important Instructions

Build the project step by step.

Create the project structure.

Configure Supabase.

Create the complete database schema.

Generate SQL for all tables.

Configure authentication.

Configure RLS policies.

Build the UI page by page.

Connect frontend with Supabase.

Test every feature before moving to the next.

Do not skip any step.

Generate complete, production-ready code and ensure the application is fully functional.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/dff2742f-2925-43a5-a239-679f7d5ca628).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
