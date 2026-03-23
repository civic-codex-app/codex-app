-- 020_new_issues.sql
-- Add 8 new hot-button quiz issues

INSERT INTO issues (name, slug, description, category, icon) VALUES
  ('Reproductive Rights & Abortion', 'reproductive-rights', 'Whether abortion should be legal, who decides, and what health care options are available for women.', 'social', 'Heart'),
  ('LGBTQ+ Rights', 'lgbtq-rights', 'Laws about same-sex marriage, transgender protections, workplace discrimination, and what schools teach about gender.', 'social', 'Users'),
  ('Drug Policy & Legalization', 'drug-policy', 'Which substances are legal and how the government handles drug use — through jail, treatment, or legalization.', 'justice', 'Pill'),
  ('Voting Rights & Elections', 'voting-rights', 'How easy or hard it is to vote, covering voter ID, mail-in voting, early voting, and voter roll management.', 'social', 'Vote'),
  ('Taxes & Government Spending', 'taxes-and-spending', 'How much the government takes from paychecks and how it spends that money on public services.', 'economy', 'DollarSign'),
  ('Labor & Unions', 'labor-and-unions', 'The balance of power between workers and employers, covering unions, minimum wage, and worker rights.', 'economy', 'Hammer'),
  ('Privacy & Surveillance', 'privacy-and-surveillance', 'How much the government can monitor calls, texts, location, and online activity in the name of safety.', 'technology', 'Eye'),
  ('Trade & Tariffs', 'trade-and-tariffs', 'Taxes on imported goods and trade deals with other countries that affect prices and American jobs.', 'economy', 'ArrowLeftRight')
ON CONFLICT (slug) DO NOTHING;
