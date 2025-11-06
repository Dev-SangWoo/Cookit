create table public.recipes (
  id uuid not null default gen_random_uuid (),
  user_id uuid null,
  title text not null,
  description text null,
  ingredients jsonb not null,
  instructions jsonb not null,
  prep_time integer null,
  cook_time integer null,
  servings integer null,
  difficulty_level text null,
  category_id uuid null,
  image_urls text[] null,
  tags text[] null,
  nutrition_info jsonb null,
  is_public boolean null default true,
  source_url character varying(500) null,
  ai_generated boolean null default false,
  ai_analysis_data jsonb null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  video_url text null,
  ai_prompt text null,
  constraint recipes_pkey primary key (id),
  constraint recipes_category_id_fkey foreign KEY (category_id) references recipe_categories (id) on delete set null,
  constraint recipes_user_id_fkey foreign KEY (user_id) references user_profiles (id) on delete CASCADE,
  constraint recipes_difficulty_level_check check (
    (
      difficulty_level = any (array['easy'::text, 'medium'::text, 'hard'::text])
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_recipes_ai_generated on public.recipes using btree (ai_generated) TABLESPACE pg_default;

create index IF not exists idx_recipes_source_url on public.recipes using btree (source_url) TABLESPACE pg_default;