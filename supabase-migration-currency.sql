-- Per-bet currency. Bets are kept as separate "books" per currency
-- (no FX conversion); 'units' is the default and the primary book.
-- Plain text with a default (no CHECK constraint) so new currencies can be
-- added in the app without an ALTER TABLE each time.

alter table public.bets
  add column if not exists currency text not null default 'units';
