-- ============================================================
-- Codex Seed Data — Major Congressional Committees
-- Idempotent: safe to run multiple times
-- ============================================================

-- ============================================================
-- Senate Committees
-- ============================================================
insert into committees (name, slug, chamber, committee_type, description, website_url) values

('Senate Committee on the Judiciary', 'senate-judiciary',
 'senate', 'standing',
 'Oversees the federal judiciary, immigration policy, intellectual property, antitrust law, and constitutional amendments.',
 'https://www.judiciary.senate.gov'),

('Senate Committee on Armed Services', 'senate-armed-services',
 'senate', 'standing',
 'Responsible for legislation and oversight of the nation''s military and defense policy.',
 'https://www.armed-services.senate.gov'),

('Senate Committee on Finance', 'senate-finance',
 'senate', 'standing',
 'Jurisdiction over taxation, trade, Social Security, Medicare, and other revenue-related legislation.',
 'https://www.finance.senate.gov'),

('Senate Select Committee on Intelligence', 'senate-intelligence',
 'senate', 'select',
 'Provides oversight of U.S. intelligence activities and the intelligence community.',
 'https://www.intelligence.senate.gov'),

('Senate Committee on Foreign Relations', 'senate-foreign-relations',
 'senate', 'standing',
 'Oversees foreign policy legislation, treaties, diplomatic nominations, and international affairs.',
 'https://www.foreign.senate.gov'),

('Senate Committee on Appropriations', 'senate-appropriations',
 'senate', 'standing',
 'Responsible for writing legislation that allocates federal funds to government agencies and programs.',
 'https://www.appropriations.senate.gov'),

('Senate Committee on Banking, Housing, and Urban Affairs', 'senate-banking',
 'senate', 'standing',
 'Jurisdiction over banking, insurance, financial markets, housing, and urban development.',
 'https://www.banking.senate.gov'),

('Senate Committee on Commerce, Science, and Transportation', 'senate-commerce',
 'senate', 'standing',
 'Oversees interstate commerce, communications, transportation, science, and technology policy.',
 'https://www.commerce.senate.gov'),

('Senate Committee on Health, Education, Labor, and Pensions', 'senate-help',
 'senate', 'standing',
 'Jurisdiction over health, education, labor, and pension policy including the Affordable Care Act and student aid.',
 'https://www.help.senate.gov'),

('Senate Committee on the Budget', 'senate-budget',
 'senate', 'standing',
 'Responsible for drafting Congress''s annual budget plan and monitoring federal spending.',
 'https://www.budget.senate.gov'),

('Senate Committee on Homeland Security and Governmental Affairs', 'senate-homeland-security',
 'senate', 'standing',
 'Oversees the Department of Homeland Security, government operations, and federal workforce management.',
 'https://www.hsgac.senate.gov'),

('Senate Committee on Energy and Natural Resources', 'senate-energy',
 'senate', 'standing',
 'Jurisdiction over energy policy, public lands, water resources, and mineral conservation.',
 'https://www.energy.senate.gov'),

('Senate Committee on Environment and Public Works', 'senate-environment',
 'senate', 'standing',
 'Oversees environmental policy, infrastructure, nuclear regulation, and public works projects.',
 'https://www.epw.senate.gov'),

('Senate Committee on Veterans'' Affairs', 'senate-veterans-affairs',
 'senate', 'standing',
 'Responsible for legislation regarding veterans'' benefits, healthcare, and services.',
 'https://www.veterans.senate.gov')

on conflict (slug) do update set
  name           = excluded.name,
  chamber        = excluded.chamber,
  committee_type = excluded.committee_type,
  description    = excluded.description,
  website_url    = excluded.website_url;

-- ============================================================
-- House Committees
-- ============================================================
insert into committees (name, slug, chamber, committee_type, description, website_url) values

('House Committee on Ways and Means', 'house-ways-and-means',
 'house', 'standing',
 'Chief tax-writing committee with jurisdiction over taxation, trade, Social Security, and Medicare.',
 'https://waysandmeans.house.gov'),

('House Committee on Armed Services', 'house-armed-services',
 'house', 'standing',
 'Responsible for defense policy, military operations, and oversight of the Department of Defense.',
 'https://armedservices.house.gov'),

('House Committee on the Judiciary', 'house-judiciary',
 'house', 'standing',
 'Oversees the administration of justice, constitutional amendments, immigration policy, and federal courts.',
 'https://judiciary.house.gov'),

('House Permanent Select Committee on Intelligence', 'house-intelligence',
 'house', 'select',
 'Provides legislative and budgetary oversight of U.S. intelligence agencies and activities.',
 'https://intelligence.house.gov'),

('House Committee on Appropriations', 'house-appropriations',
 'house', 'standing',
 'Responsible for setting specific expenditures of money by the federal government.',
 'https://appropriations.house.gov'),

('House Committee on Energy and Commerce', 'house-energy-and-commerce',
 'house', 'standing',
 'Broad jurisdiction over energy, health, communications, technology, consumer protection, and environmental policy.',
 'https://energycommerce.house.gov'),

('House Committee on Financial Services', 'house-financial-services',
 'house', 'standing',
 'Oversees the financial services industry including banking, insurance, real estate, and securities.',
 'https://financialservices.house.gov'),

('House Committee on Foreign Affairs', 'house-foreign-affairs',
 'house', 'standing',
 'Jurisdiction over foreign assistance, international organizations, and U.S. diplomatic relations.',
 'https://foreignaffairs.house.gov'),

('House Committee on Education and the Workforce', 'house-education-workforce',
 'house', 'standing',
 'Oversees education and labor policy including K-12, higher education, workforce development, and worker protections.',
 'https://edworkforce.house.gov'),

('House Committee on Homeland Security', 'house-homeland-security',
 'house', 'standing',
 'Responsible for oversight of the Department of Homeland Security and related border and security policy.',
 'https://homeland.house.gov'),

('House Committee on the Budget', 'house-budget',
 'house', 'standing',
 'Establishes the congressional budget resolution and oversees the budget enforcement process.',
 'https://budget.house.gov'),

('House Committee on Natural Resources', 'house-natural-resources',
 'house', 'standing',
 'Jurisdiction over public lands, oceans, wildlife, Native American affairs, and natural resource management.',
 'https://naturalresources.house.gov'),

('House Committee on Veterans'' Affairs', 'house-veterans-affairs',
 'house', 'standing',
 'Oversees veterans'' benefits, healthcare, education assistance, and memorial affairs.',
 'https://veterans.house.gov'),

('House Committee on Transportation and Infrastructure', 'house-transportation',
 'house', 'standing',
 'Jurisdiction over highways, transit, aviation, railroads, water resources, and infrastructure investment.',
 'https://transportation.house.gov'),

('House Committee on Oversight and Accountability', 'house-oversight',
 'house', 'standing',
 'Primary investigative committee of the House with broad authority to investigate any matter of public interest.',
 'https://oversight.house.gov')

on conflict (slug) do update set
  name           = excluded.name,
  chamber        = excluded.chamber,
  committee_type = excluded.committee_type,
  description    = excluded.description,
  website_url    = excluded.website_url;
