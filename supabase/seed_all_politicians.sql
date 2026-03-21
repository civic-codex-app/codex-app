-- ============================================================
-- Codex Seed Data — All Current U.S. Politicians
-- 100 Senators (119th Congress), 50 Governors, 100 House Reps
-- Generated 2026-03-20
-- Uses ON CONFLICT to upsert against existing seed.sql entries
-- ============================================================

-- ============================================================
-- SENATORS (119th Congress, 2025-2027) — Alphabetical by State
-- ============================================================

-- Alabama
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Tommy Tuberville', 'tommy-tuberville', 'AL', 'senate', 'republican', 'U.S. Senator', 2021, 'Junior United States Senator from Alabama. Former head football coach at Auburn University.', 'https://www.tuberville.senate.gov', null, 'https://en.wikipedia.org/wiki/Tommy_Tuberville', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Katie Britt', 'katie-britt', 'AL', 'senate', 'republican', 'U.S. Senator', 2023, 'Junior United States Senator from Alabama. Youngest Republican woman ever elected to the U.S. Senate.', 'https://www.britt.senate.gov', null, 'https://en.wikipedia.org/wiki/Katie_Britt', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

-- Alaska
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Lisa Murkowski', 'lisa-murkowski', 'AK', 'senate', 'republican', 'U.S. Senator', 2002, 'Senior United States Senator from Alaska. Daughter of former Senator and Governor Frank Murkowski.', 'https://www.murkowski.senate.gov', null, 'https://en.wikipedia.org/wiki/Lisa_Murkowski', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Dan Sullivan', 'dan-sullivan', 'AK', 'senate', 'republican', 'U.S. Senator', 2015, 'Junior United States Senator from Alaska. Former Attorney General of Alaska and U.S. Marine.', 'https://www.sullivan.senate.gov', null, 'https://en.wikipedia.org/wiki/Dan_Sullivan_(U.S._senator)', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

-- Arizona
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Ruben Gallego', 'ruben-gallego', 'AZ', 'senate', 'democrat', 'U.S. Senator', 2025, 'Junior United States Senator from Arizona. Former U.S. Representative and Marine Corps veteran.', 'https://www.gallego.senate.gov', null, 'https://en.wikipedia.org/wiki/Ruben_Gallego', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Mark Kelly', 'mark-kelly', 'AZ', 'senate', 'democrat', 'U.S. Senator', 2020, 'Senior United States Senator from Arizona. Former NASA astronaut and U.S. Navy captain.', 'https://www.kelly.senate.gov', null, 'https://en.wikipedia.org/wiki/Mark_Kelly', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

-- Arkansas
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('John Boozman', 'john-boozman', 'AR', 'senate', 'republican', 'U.S. Senator', 2011, 'Senior United States Senator from Arkansas. Former U.S. Representative and optometrist.', 'https://www.boozman.senate.gov', null, 'https://en.wikipedia.org/wiki/John_Boozman', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Tom Cotton', 'tom-cotton', 'AR', 'senate', 'republican', 'U.S. Senator', 2015, 'Junior United States Senator from Arkansas. U.S. Army veteran who served in Iraq and Afghanistan.', 'https://www.cotton.senate.gov', null, 'https://en.wikipedia.org/wiki/Tom_Cotton', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

-- California
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Alex Padilla', 'alex-padilla', 'CA', 'senate', 'democrat', 'U.S. Senator', 2021, 'Senior United States Senator from California. First Latino senator from California.', 'https://www.padilla.senate.gov', null, 'https://en.wikipedia.org/wiki/Alex_Padilla', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Adam Schiff', 'adam-schiff', 'CA', 'senate', 'democrat', 'U.S. Senator', 2025, 'Junior United States Senator from California. Former U.S. Representative who chaired the House Intelligence Committee.', 'https://www.schiff.senate.gov', null, 'https://en.wikipedia.org/wiki/Adam_Schiff', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

-- Colorado
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Michael Bennet', 'michael-bennet', 'CO', 'senate', 'democrat', 'U.S. Senator', 2009, 'Senior United States Senator from Colorado. Former superintendent of Denver Public Schools.', 'https://www.bennet.senate.gov', null, 'https://en.wikipedia.org/wiki/Michael_Bennet', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('John Hickenlooper', 'john-hickenlooper', 'CO', 'senate', 'democrat', 'U.S. Senator', 2021, 'Junior United States Senator from Colorado. Former Governor of Colorado and Mayor of Denver.', 'https://www.hickenlooper.senate.gov', null, 'https://en.wikipedia.org/wiki/John_Hickenlooper', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

-- Connecticut
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Richard Blumenthal', 'richard-blumenthal', 'CT', 'senate', 'democrat', 'U.S. Senator', 2011, 'Senior United States Senator from Connecticut. Former Attorney General of Connecticut.', 'https://www.blumenthal.senate.gov', null, 'https://en.wikipedia.org/wiki/Richard_Blumenthal', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Chris Murphy', 'chris-murphy', 'CT', 'senate', 'democrat', 'U.S. Senator', 2013, 'Junior United States Senator from Connecticut. Known for advocacy on gun control legislation.', 'https://www.murphy.senate.gov', null, 'https://en.wikipedia.org/wiki/Chris_Murphy', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

-- Delaware
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Lisa Blunt Rochester', 'lisa-blunt-rochester', 'DE', 'senate', 'democrat', 'U.S. Senator', 2025, 'Junior United States Senator from Delaware. First woman and first Black person to represent Delaware in the Senate.', 'https://www.bluntrochester.senate.gov', null, 'https://en.wikipedia.org/wiki/Lisa_Blunt_Rochester', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Chris Coons', 'chris-coons', 'DE', 'senate', 'democrat', 'U.S. Senator', 2010, 'Junior United States Senator from Delaware. Former county executive of New Castle County.', 'https://www.coons.senate.gov', null, 'https://en.wikipedia.org/wiki/Chris_Coons', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

-- Florida
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Ashley Moody', 'ashley-moody', 'FL', 'senate', 'republican', 'U.S. Senator', 2025, 'Senior United States Senator from Florida. Appointed by Governor DeSantis after Marco Rubio became Secretary of State.', 'https://www.moody.senate.gov', null, 'https://en.wikipedia.org/wiki/Ashley_Moody', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Rick Scott', 'rick-scott', 'FL', 'senate', 'republican', 'U.S. Senator', 2019, 'Junior United States Senator from Florida. Former Governor of Florida.', 'https://www.rickscott.senate.gov', null, 'https://en.wikipedia.org/wiki/Rick_Scott', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

-- Georgia
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Jon Ossoff', 'jon-ossoff', 'GA', 'senate', 'democrat', 'U.S. Senator', 2021, 'Junior United States Senator from Georgia. Youngest member of the U.S. Senate when sworn in.', 'https://www.ossoff.senate.gov', null, 'https://en.wikipedia.org/wiki/Jon_Ossoff', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Raphael Warnock', 'raphael-warnock', 'GA', 'senate', 'democrat', 'U.S. Senator', 2021, 'Senior United States Senator from Georgia. Senior pastor of Ebenezer Baptist Church in Atlanta.', 'https://www.warnock.senate.gov', null, 'https://en.wikipedia.org/wiki/Raphael_Warnock', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

-- Hawaii
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Mazie Hirono', 'mazie-hirono', 'HI', 'senate', 'democrat', 'U.S. Senator', 2013, 'Senior United States Senator from Hawaii. First Asian-American woman and first Buddhist elected to the Senate.', 'https://www.hirono.senate.gov', null, 'https://en.wikipedia.org/wiki/Mazie_Hirono', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Brian Schatz', 'brian-schatz', 'HI', 'senate', 'democrat', 'U.S. Senator', 2012, 'Junior United States Senator from Hawaii. Former Lieutenant Governor of Hawaii.', 'https://www.schatz.senate.gov', null, 'https://en.wikipedia.org/wiki/Brian_Schatz', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

-- Idaho
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Mike Crapo', 'mike-crapo', 'ID', 'senate', 'republican', 'U.S. Senator', 1999, 'Senior United States Senator from Idaho. Chairman of the Senate Finance Committee.', 'https://www.crapo.senate.gov', null, 'https://en.wikipedia.org/wiki/Mike_Crapo', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Jim Risch', 'jim-risch', 'ID', 'senate', 'republican', 'U.S. Senator', 2009, 'Junior United States Senator from Idaho. Former Governor and Lieutenant Governor of Idaho.', 'https://www.risch.senate.gov', null, 'https://en.wikipedia.org/wiki/Jim_Risch', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

-- Illinois
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Dick Durbin', 'dick-durbin', 'IL', 'senate', 'democrat', 'U.S. Senator', 1997, 'Senior United States Senator from Illinois. Senate Democratic Whip.', 'https://www.durbin.senate.gov', null, 'https://en.wikipedia.org/wiki/Dick_Durbin', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Tammy Duckworth', 'tammy-duckworth', 'IL', 'senate', 'democrat', 'U.S. Senator', 2017, 'Junior United States Senator from Illinois. Purple Heart recipient and Iraq War veteran who lost both legs in combat.', 'https://www.duckworth.senate.gov', null, 'https://en.wikipedia.org/wiki/Tammy_Duckworth', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

-- Indiana
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Todd Young', 'todd-young', 'IN', 'senate', 'republican', 'U.S. Senator', 2017, 'Senior United States Senator from Indiana. U.S. Marine Corps veteran.', 'https://www.young.senate.gov', null, 'https://en.wikipedia.org/wiki/Todd_Young', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Jim Banks', 'jim-banks', 'IN', 'senate', 'republican', 'U.S. Senator', 2025, 'Junior United States Senator from Indiana. Former U.S. Representative and Navy Reserve officer.', 'https://www.banks.senate.gov', null, 'https://en.wikipedia.org/wiki/Jim_Banks', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

-- Iowa
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Chuck Grassley', 'chuck-grassley', 'IA', 'senate', 'republican', 'U.S. Senator', 1981, 'Senior United States Senator from Iowa. President pro tempore of the Senate.', 'https://www.grassley.senate.gov', null, 'https://en.wikipedia.org/wiki/Chuck_Grassley', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Joni Ernst', 'joni-ernst', 'IA', 'senate', 'republican', 'U.S. Senator', 2015, 'Junior United States Senator from Iowa. First woman to represent Iowa in Congress and combat veteran.', 'https://www.ernst.senate.gov', null, 'https://en.wikipedia.org/wiki/Joni_Ernst', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

-- Kansas
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Jerry Moran', 'jerry-moran', 'KS', 'senate', 'republican', 'U.S. Senator', 2011, 'Senior United States Senator from Kansas. Former U.S. Representative.', 'https://www.moran.senate.gov', null, 'https://en.wikipedia.org/wiki/Jerry_Moran', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Roger Marshall', 'roger-marshall', 'KS', 'senate', 'republican', 'U.S. Senator', 2021, 'Junior United States Senator from Kansas. Physician and former U.S. Representative.', 'https://www.marshall.senate.gov', null, 'https://en.wikipedia.org/wiki/Roger_Marshall', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

-- Kentucky
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Mitch McConnell', 'mitch-mcconnell', 'KY', 'senate', 'republican', 'U.S. Senator', 1985, 'Senior United States Senator from Kentucky. Longest-serving Senate party leader in U.S. history.', 'https://www.mcconnell.senate.gov', null, 'https://en.wikipedia.org/wiki/Mitch_McConnell', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Rand Paul', 'rand-paul', 'KY', 'senate', 'republican', 'U.S. Senator', 2011, 'Junior United States Senator from Kentucky. Ophthalmologist and son of former Congressman Ron Paul.', 'https://www.paul.senate.gov', null, 'https://en.wikipedia.org/wiki/Rand_Paul', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

-- Louisiana
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Bill Cassidy', 'bill-cassidy', 'LA', 'senate', 'republican', 'U.S. Senator', 2015, 'Senior United States Senator from Louisiana. Physician and former U.S. Representative.', 'https://www.cassidy.senate.gov', null, 'https://en.wikipedia.org/wiki/Bill_Cassidy', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('John Kennedy', 'john-kennedy', 'LA', 'senate', 'republican', 'U.S. Senator', 2017, 'Junior United States Senator from Louisiana. Former Louisiana State Treasurer.', 'https://www.kennedy.senate.gov', null, 'https://en.wikipedia.org/wiki/John_Kennedy_(Louisiana_politician)', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

-- Maine
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Susan Collins', 'susan-collins', 'ME', 'senate', 'republican', 'U.S. Senator', 1997, 'Senior United States Senator from Maine. Known as a moderate and centrist Republican.', 'https://www.collins.senate.gov', null, 'https://en.wikipedia.org/wiki/Susan_Collins', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Angus King', 'angus-king', 'ME', 'senate', 'independent', 'U.S. Senator', 2013, 'Junior United States Senator from Maine. Independent who caucuses with Democrats. Former Governor of Maine.', 'https://www.king.senate.gov', null, 'https://en.wikipedia.org/wiki/Angus_King', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

-- Maryland
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Angela Alsobrooks', 'angela-alsobrooks', 'MD', 'senate', 'democrat', 'U.S. Senator', 2025, 'Junior United States Senator from Maryland. Former Prince George''s County Executive.', 'https://www.alsobrooks.senate.gov', null, 'https://en.wikipedia.org/wiki/Angela_Alsobrooks', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Chris Van Hollen', 'chris-van-hollen', 'MD', 'senate', 'democrat', 'U.S. Senator', 2017, 'Junior United States Senator from Maryland. Former U.S. Representative.', 'https://www.vanhollen.senate.gov', null, 'https://en.wikipedia.org/wiki/Chris_Van_Hollen', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

-- Massachusetts
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Elizabeth Warren', 'elizabeth-warren', 'MA', 'senate', 'democrat', 'U.S. Senator', 2013, 'Senior United States Senator from Massachusetts. Former Harvard Law professor and consumer protection advocate.', 'https://www.warren.senate.gov', null, 'https://en.wikipedia.org/wiki/Elizabeth_Warren', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Ed Markey', 'ed-markey', 'MA', 'senate', 'democrat', 'U.S. Senator', 2013, 'Junior United States Senator from Massachusetts. Co-author of the Green New Deal resolution.', 'https://www.markey.senate.gov', null, 'https://en.wikipedia.org/wiki/Ed_Markey', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

-- Michigan
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Gary Peters', 'gary-peters', 'MI', 'senate', 'democrat', 'U.S. Senator', 2015, 'Senior United States Senator from Michigan. Former U.S. Representative and Navy Reserve officer.', 'https://www.peters.senate.gov', null, 'https://en.wikipedia.org/wiki/Gary_Peters', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Elissa Slotkin', 'elissa-slotkin', 'MI', 'senate', 'democrat', 'U.S. Senator', 2025, 'Junior United States Senator from Michigan. Former CIA analyst and U.S. Representative.', 'https://www.slotkin.senate.gov', null, 'https://en.wikipedia.org/wiki/Elissa_Slotkin', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

-- Minnesota
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Amy Klobuchar', 'amy-klobuchar', 'MN', 'senate', 'democrat', 'U.S. Senator', 2007, 'Senior United States Senator from Minnesota. Former Hennepin County Attorney and 2020 presidential candidate.', 'https://www.klobuchar.senate.gov', null, 'https://en.wikipedia.org/wiki/Amy_Klobuchar', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Tina Smith', 'tina-smith', 'MN', 'senate', 'democrat', 'U.S. Senator', 2018, 'Junior United States Senator from Minnesota. Former Lieutenant Governor of Minnesota.', 'https://www.smith.senate.gov', null, 'https://en.wikipedia.org/wiki/Tina_Smith', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

-- Mississippi
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Roger Wicker', 'roger-wicker', 'MS', 'senate', 'republican', 'U.S. Senator', 2007, 'Senior United States Senator from Mississippi. Chairman of the Senate Armed Services Committee.', 'https://www.wicker.senate.gov', null, 'https://en.wikipedia.org/wiki/Roger_Wicker', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Cindy Hyde-Smith', 'cindy-hyde-smith', 'MS', 'senate', 'republican', 'U.S. Senator', 2018, 'Junior United States Senator from Mississippi. First woman to represent Mississippi in Congress.', 'https://www.hydesmith.senate.gov', null, 'https://en.wikipedia.org/wiki/Cindy_Hyde-Smith', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

-- Missouri
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Josh Hawley', 'josh-hawley', 'MO', 'senate', 'republican', 'U.S. Senator', 2019, 'Junior United States Senator from Missouri. Former Attorney General of Missouri.', 'https://www.hawley.senate.gov', null, 'https://en.wikipedia.org/wiki/Josh_Hawley', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Eric Schmitt', 'eric-schmitt', 'MO', 'senate', 'republican', 'U.S. Senator', 2023, 'Senior United States Senator from Missouri. Former Attorney General and State Treasurer of Missouri.', 'https://www.schmitt.senate.gov', null, 'https://en.wikipedia.org/wiki/Eric_Schmitt', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

-- Montana
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Steve Daines', 'steve-daines', 'MT', 'senate', 'republican', 'U.S. Senator', 2015, 'Senior United States Senator from Montana. Chairman of the National Republican Senatorial Committee.', 'https://www.daines.senate.gov', null, 'https://en.wikipedia.org/wiki/Steve_Daines', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Tim Sheehy', 'tim-sheehy', 'MT', 'senate', 'republican', 'U.S. Senator', 2025, 'Junior United States Senator from Montana. Former Navy SEAL and aerial firefighting entrepreneur.', 'https://www.sheehy.senate.gov', null, 'https://en.wikipedia.org/wiki/Tim_Sheehy', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

-- Nebraska
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Deb Fischer', 'deb-fischer', 'NE', 'senate', 'republican', 'U.S. Senator', 2013, 'Senior United States Senator from Nebraska. Former member of the Nebraska Legislature.', 'https://www.fischer.senate.gov', null, 'https://en.wikipedia.org/wiki/Deb_Fischer', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Pete Ricketts', 'pete-ricketts', 'NE', 'senate', 'republican', 'U.S. Senator', 2023, 'Junior United States Senator from Nebraska. Former Governor of Nebraska.', 'https://www.ricketts.senate.gov', null, 'https://en.wikipedia.org/wiki/Pete_Ricketts', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

-- Nevada
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Catherine Cortez Masto', 'catherine-cortez-masto', 'NV', 'senate', 'democrat', 'U.S. Senator', 2017, 'Senior United States Senator from Nevada. First Latina elected to the U.S. Senate.', 'https://www.cortezmasto.senate.gov', null, 'https://en.wikipedia.org/wiki/Catherine_Cortez_Masto', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Jacky Rosen', 'jacky-rosen', 'NV', 'senate', 'democrat', 'U.S. Senator', 2019, 'Junior United States Senator from Nevada. Former computer programmer and synagogue president.', 'https://www.rosen.senate.gov', null, 'https://en.wikipedia.org/wiki/Jacky_Rosen', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

-- New Hampshire
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Jeanne Shaheen', 'jeanne-shaheen', 'NH', 'senate', 'democrat', 'U.S. Senator', 2009, 'Senior United States Senator from New Hampshire. Former Governor of New Hampshire.', 'https://www.shaheen.senate.gov', null, 'https://en.wikipedia.org/wiki/Jeanne_Shaheen', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Maggie Hassan', 'maggie-hassan', 'NH', 'senate', 'democrat', 'U.S. Senator', 2017, 'Junior United States Senator from New Hampshire. Former Governor of New Hampshire.', 'https://www.hassan.senate.gov', null, 'https://en.wikipedia.org/wiki/Maggie_Hassan', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

-- New Jersey
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Cory Booker', 'cory-booker', 'NJ', 'senate', 'democrat', 'U.S. Senator', 2013, 'Senior United States Senator from New Jersey. Former Mayor of Newark.', 'https://www.booker.senate.gov', null, 'https://en.wikipedia.org/wiki/Cory_Booker', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Andy Kim', 'andy-kim', 'NJ', 'senate', 'democrat', 'U.S. Senator', 2025, 'Junior United States Senator from New Jersey. Former U.S. Representative and national security official.', 'https://www.kim.senate.gov', null, 'https://en.wikipedia.org/wiki/Andy_Kim_(politician)', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

-- New Mexico
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Martin Heinrich', 'martin-heinrich', 'NM', 'senate', 'democrat', 'U.S. Senator', 2013, 'Senior United States Senator from New Mexico. Former U.S. Representative.', 'https://www.heinrich.senate.gov', null, 'https://en.wikipedia.org/wiki/Martin_Heinrich', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Ben Ray Lujan', 'ben-ray-lujan', 'NM', 'senate', 'democrat', 'U.S. Senator', 2021, 'Junior United States Senator from New Mexico. Former U.S. Representative and House Assistant Speaker.', 'https://www.lujan.senate.gov', null, 'https://en.wikipedia.org/wiki/Ben_Ray_Luj%C3%A1n', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

-- New York
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Chuck Schumer', 'chuck-schumer', 'NY', 'senate', 'democrat', 'Senate Minority Leader', 1999, 'Senate Minority Leader. Senior United States Senator from New York.', 'https://www.schumer.senate.gov', null, 'https://en.wikipedia.org/wiki/Chuck_Schumer', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Kirsten Gillibrand', 'kirsten-gillibrand', 'NY', 'senate', 'democrat', 'U.S. Senator', 2009, 'Junior United States Senator from New York. Advocate for military sexual assault reform.', 'https://www.gillibrand.senate.gov', null, 'https://en.wikipedia.org/wiki/Kirsten_Gillibrand', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

-- North Carolina
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Thom Tillis', 'thom-tillis', 'NC', 'senate', 'republican', 'U.S. Senator', 2015, 'Senior United States Senator from North Carolina. Former Speaker of the North Carolina House.', 'https://www.tillis.senate.gov', null, 'https://en.wikipedia.org/wiki/Thom_Tillis', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Ted Budd', 'ted-budd', 'NC', 'senate', 'republican', 'U.S. Senator', 2023, 'Junior United States Senator from North Carolina. Former U.S. Representative.', 'https://www.budd.senate.gov', null, 'https://en.wikipedia.org/wiki/Ted_Budd', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

-- North Dakota
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('John Hoeven', 'john-hoeven', 'ND', 'senate', 'republican', 'U.S. Senator', 2011, 'Senior United States Senator from North Dakota. Former Governor of North Dakota.', 'https://www.hoeven.senate.gov', null, 'https://en.wikipedia.org/wiki/John_Hoeven', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Kevin Cramer', 'kevin-cramer', 'ND', 'senate', 'republican', 'U.S. Senator', 2019, 'Junior United States Senator from North Dakota. Former U.S. Representative.', 'https://www.cramer.senate.gov', null, 'https://en.wikipedia.org/wiki/Kevin_Cramer', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

-- Ohio
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Bernie Moreno', 'bernie-moreno', 'OH', 'senate', 'republican', 'U.S. Senator', 2025, 'Junior United States Senator from Ohio. Businessman and auto dealership owner who defeated Sherrod Brown.', 'https://www.moreno.senate.gov', null, 'https://en.wikipedia.org/wiki/Bernie_Moreno', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Jon Husted', 'jon-husted', 'OH', 'senate', 'republican', 'U.S. Senator', 2025, 'Senior United States Senator from Ohio. Appointed to replace JD Vance. Former Ohio Lieutenant Governor.', 'https://www.husted.senate.gov', null, 'https://en.wikipedia.org/wiki/Jon_Husted', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

-- Oklahoma
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('James Lankford', 'james-lankford', 'OK', 'senate', 'republican', 'U.S. Senator', 2015, 'Senior United States Senator from Oklahoma. Former U.S. Representative and Baptist minister.', 'https://www.lankford.senate.gov', null, 'https://en.wikipedia.org/wiki/James_Lankford', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Markwayne Mullin', 'markwayne-mullin', 'OK', 'senate', 'republican', 'U.S. Senator', 2023, 'Junior United States Senator from Oklahoma. Former U.S. Representative and Cherokee Nation citizen.', 'https://www.mullin.senate.gov', null, 'https://en.wikipedia.org/wiki/Markwayne_Mullin', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

-- Oregon
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Ron Wyden', 'ron-wyden', 'OR', 'senate', 'democrat', 'U.S. Senator', 1996, 'Senior United States Senator from Oregon. Ranking member of the Senate Finance Committee.', 'https://www.wyden.senate.gov', null, 'https://en.wikipedia.org/wiki/Ron_Wyden', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Jeff Merkley', 'jeff-merkley', 'OR', 'senate', 'democrat', 'U.S. Senator', 2009, 'Junior United States Senator from Oregon. Former Speaker of the Oregon House.', 'https://www.merkley.senate.gov', null, 'https://en.wikipedia.org/wiki/Jeff_Merkley', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

-- Pennsylvania
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('John Fetterman', 'john-fetterman', 'PA', 'senate', 'democrat', 'U.S. Senator', 2023, 'Junior United States Senator from Pennsylvania. Former Lieutenant Governor and Mayor of Braddock.', 'https://www.fetterman.senate.gov', null, 'https://en.wikipedia.org/wiki/John_Fetterman', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Dave McCormick', 'dave-mccormick', 'PA', 'senate', 'republican', 'U.S. Senator', 2025, 'Senior United States Senator from Pennsylvania. Former CEO of Bridgewater Associates and Under Secretary of the Treasury.', 'https://www.mccormick.senate.gov', null, 'https://en.wikipedia.org/wiki/David_McCormick_(politician)', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

-- Rhode Island
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Jack Reed', 'jack-reed', 'RI', 'senate', 'democrat', 'U.S. Senator', 1997, 'Senior United States Senator from Rhode Island. Ranking member of the Senate Armed Services Committee.', 'https://www.reed.senate.gov', null, 'https://en.wikipedia.org/wiki/Jack_Reed_(politician)', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Sheldon Whitehouse', 'sheldon-whitehouse', 'RI', 'senate', 'democrat', 'U.S. Senator', 2007, 'Junior United States Senator from Rhode Island. Former Attorney General of Rhode Island.', 'https://www.whitehouse.senate.gov', null, 'https://en.wikipedia.org/wiki/Sheldon_Whitehouse', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

-- South Carolina
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Lindsey Graham', 'lindsey-graham', 'SC', 'senate', 'republican', 'U.S. Senator', 2003, 'Senior United States Senator from South Carolina. Former U.S. Representative and Air Force JAG officer.', 'https://www.lgraham.senate.gov', null, 'https://en.wikipedia.org/wiki/Lindsey_Graham', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Tim Scott', 'tim-scott', 'SC', 'senate', 'republican', 'U.S. Senator', 2013, 'Junior United States Senator from South Carolina. First African-American senator from South Carolina.', 'https://www.scott.senate.gov', null, 'https://en.wikipedia.org/wiki/Tim_Scott', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

-- South Dakota
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('John Thune', 'john-thune', 'SD', 'senate', 'republican', 'Senate Majority Leader', 2005, 'Senate Majority Leader and senior United States Senator from South Dakota.', 'https://www.thune.senate.gov', null, 'https://en.wikipedia.org/wiki/John_Thune', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Mike Rounds', 'mike-rounds', 'SD', 'senate', 'republican', 'U.S. Senator', 2015, 'Junior United States Senator from South Dakota. Former Governor of South Dakota.', 'https://www.rounds.senate.gov', null, 'https://en.wikipedia.org/wiki/Mike_Rounds', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

-- Tennessee
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Marsha Blackburn', 'marsha-blackburn', 'TN', 'senate', 'republican', 'U.S. Senator', 2019, 'Junior United States Senator from Tennessee. Former U.S. Representative.', 'https://www.blackburn.senate.gov', null, 'https://en.wikipedia.org/wiki/Marsha_Blackburn', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Bill Hagerty', 'bill-hagerty', 'TN', 'senate', 'republican', 'U.S. Senator', 2021, 'Senior United States Senator from Tennessee. Former U.S. Ambassador to Japan.', 'https://www.hagerty.senate.gov', null, 'https://en.wikipedia.org/wiki/Bill_Hagerty', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

-- Texas
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Ted Cruz', 'ted-cruz', 'TX', 'senate', 'republican', 'U.S. Senator', 2013, 'Senior United States Senator from Texas. Former Solicitor General of Texas.', 'https://www.cruz.senate.gov', null, 'https://en.wikipedia.org/wiki/Ted_Cruz', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('John Cornyn', 'john-cornyn', 'TX', 'senate', 'republican', 'U.S. Senator', 2002, 'Junior United States Senator from Texas. Former Attorney General and Supreme Court Justice of Texas.', 'https://www.cornyn.senate.gov', null, 'https://en.wikipedia.org/wiki/John_Cornyn', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

-- Utah
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Mike Lee', 'mike-lee', 'UT', 'senate', 'republican', 'U.S. Senator', 2011, 'Senior United States Senator from Utah. Former federal law clerk to Justice Samuel Alito.', 'https://www.lee.senate.gov', null, 'https://en.wikipedia.org/wiki/Mike_Lee_(politician)', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('John Curtis', 'john-curtis', 'UT', 'senate', 'republican', 'U.S. Senator', 2025, 'Junior United States Senator from Utah. Former U.S. Representative and Mayor of Provo.', 'https://www.curtis.senate.gov', null, 'https://en.wikipedia.org/wiki/John_Curtis_(politician)', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

-- Vermont
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Bernie Sanders', 'bernie-sanders', 'VT', 'senate', 'independent', 'U.S. Senator', 2007, 'Senior United States Senator from Vermont. Longest-serving independent in congressional history.', 'https://www.sanders.senate.gov', null, 'https://en.wikipedia.org/wiki/Bernie_Sanders', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Peter Welch', 'peter-welch', 'VT', 'senate', 'democrat', 'U.S. Senator', 2023, 'Junior United States Senator from Vermont. Former U.S. Representative.', 'https://www.welch.senate.gov', null, 'https://en.wikipedia.org/wiki/Peter_Welch', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

-- Virginia
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Mark Warner', 'mark-warner', 'VA', 'senate', 'democrat', 'U.S. Senator', 2009, 'Senior United States Senator from Virginia. Vice Chairman of the Senate Intelligence Committee.', 'https://www.warner.senate.gov', null, 'https://en.wikipedia.org/wiki/Mark_Warner', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Tim Kaine', 'tim-kaine', 'VA', 'senate', 'democrat', 'U.S. Senator', 2013, 'Junior United States Senator from Virginia. Former Governor of Virginia and 2016 VP nominee.', 'https://www.kaine.senate.gov', null, 'https://en.wikipedia.org/wiki/Tim_Kaine', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

-- Washington
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Patty Murray', 'patty-murray', 'WA', 'senate', 'democrat', 'U.S. Senator', 1993, 'Senior United States Senator from Washington. President pro tempore emerita of the Senate.', 'https://www.murray.senate.gov', null, 'https://en.wikipedia.org/wiki/Patty_Murray', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Maria Cantwell', 'maria-cantwell', 'WA', 'senate', 'democrat', 'U.S. Senator', 2001, 'Junior United States Senator from Washington. Ranking member of the Senate Commerce Committee.', 'https://www.cantwell.senate.gov', null, 'https://en.wikipedia.org/wiki/Maria_Cantwell', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

-- West Virginia
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Shelley Moore Capito', 'shelley-moore-capito', 'WV', 'senate', 'republican', 'U.S. Senator', 2015, 'Senior United States Senator from West Virginia. First woman elected to the Senate from West Virginia.', 'https://www.capito.senate.gov', null, 'https://en.wikipedia.org/wiki/Shelley_Moore_Capito', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Jim Justice', 'jim-justice', 'WV', 'senate', 'republican', 'U.S. Senator', 2025, 'Junior United States Senator from West Virginia. Former Governor of West Virginia.', 'https://www.justice.senate.gov', null, 'https://en.wikipedia.org/wiki/Jim_Justice', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

-- Wisconsin
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Ron Johnson', 'ron-johnson', 'WI', 'senate', 'republican', 'U.S. Senator', 2011, 'Senior United States Senator from Wisconsin. Former plastics manufacturing CEO.', 'https://www.ronjohnson.senate.gov', null, 'https://en.wikipedia.org/wiki/Ron_Johnson_(Wisconsin_politician)', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Tammy Baldwin', 'tammy-baldwin', 'WI', 'senate', 'democrat', 'U.S. Senator', 2013, 'Junior United States Senator from Wisconsin. First openly gay person elected to the U.S. Senate.', 'https://www.baldwin.senate.gov', null, 'https://en.wikipedia.org/wiki/Tammy_Baldwin', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

-- Wyoming
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('John Barrasso', 'john-barrasso', 'WY', 'senate', 'republican', 'U.S. Senator', 2007, 'Senior United States Senator from Wyoming. Senate Republican Conference Chairman.', 'https://www.barrasso.senate.gov', null, 'https://en.wikipedia.org/wiki/John_Barrasso', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Cynthia Lummis', 'cynthia-lummis', 'WY', 'senate', 'republican', 'U.S. Senator', 2021, 'Junior United States Senator from Wyoming. Former U.S. Representative and State Treasurer.', 'https://www.lummis.senate.gov', null, 'https://en.wikipedia.org/wiki/Cynthia_Lummis', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

-- ============================================================
-- GOVERNORS (All 50 States, current as of 2025)
-- ============================================================

-- Alabama
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Kay Ivey', 'kay-ivey', 'AL', 'governor', 'republican', 'Governor of Alabama', 2017, '54th Governor of Alabama. First Republican woman to serve as Governor of Alabama.', 'https://governor.alabama.gov', null, 'https://en.wikipedia.org/wiki/Kay_Ivey', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

-- Alaska
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Mike Dunleavy', 'mike-dunleavy', 'AK', 'governor', 'republican', 'Governor of Alaska', 2018, '12th Governor of Alaska. Former state senator and school administrator.', 'https://gov.alaska.gov', null, 'https://en.wikipedia.org/wiki/Mike_Dunleavy', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

-- Arizona
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Katie Hobbs', 'katie-hobbs', 'AZ', 'governor', 'democrat', 'Governor of Arizona', 2023, '24th Governor of Arizona. Former Arizona Secretary of State.', 'https://azgovernor.gov', null, 'https://en.wikipedia.org/wiki/Katie_Hobbs', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

-- Arkansas
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Sarah Huckabee Sanders', 'sarah-huckabee-sanders', 'AR', 'governor', 'republican', 'Governor of Arkansas', 2023, '47th Governor of Arkansas. Former White House Press Secretary and daughter of Mike Huckabee.', 'https://governor.arkansas.gov', null, 'https://en.wikipedia.org/wiki/Sarah_Huckabee_Sanders', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

-- California
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Gavin Newsom', 'gavin-newsom', 'CA', 'governor', 'democrat', 'Governor of California', 2019, '40th Governor of California. Former Mayor of San Francisco and Lieutenant Governor.', 'https://www.gov.ca.gov', null, 'https://en.wikipedia.org/wiki/Gavin_Newsom', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

-- Colorado
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Jared Polis', 'jared-polis', 'CO', 'governor', 'democrat', 'Governor of Colorado', 2019, '43rd Governor of Colorado. First openly gay man elected governor of a U.S. state.', 'https://www.colorado.gov/governor', null, 'https://en.wikipedia.org/wiki/Jared_Polis', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

-- Connecticut
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Ned Lamont', 'ned-lamont', 'CT', 'governor', 'democrat', 'Governor of Connecticut', 2019, '89th Governor of Connecticut. Businessman and cable television entrepreneur.', 'https://portal.ct.gov/governor', null, 'https://en.wikipedia.org/wiki/Ned_Lamont', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

-- Delaware
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Matt Meyer', 'matt-meyer', 'DE', 'governor', 'democrat', 'Governor of Delaware', 2025, '75th Governor of Delaware. Former New Castle County Executive.', 'https://governor.delaware.gov', null, 'https://en.wikipedia.org/wiki/Matt_Meyer_(politician)', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

-- Florida
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Ron DeSantis', 'ron-desantis', 'FL', 'governor', 'republican', 'Governor of Florida', 2019, '46th Governor of Florida. Former U.S. Representative and Navy JAG officer.', 'https://www.flgov.com', null, 'https://en.wikipedia.org/wiki/Ron_DeSantis', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

-- Georgia
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Brian Kemp', 'brian-kemp', 'GA', 'governor', 'republican', 'Governor of Georgia', 2019, '83rd Governor of Georgia. Former Georgia Secretary of State.', 'https://gov.georgia.gov', null, 'https://en.wikipedia.org/wiki/Brian_Kemp', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

-- Hawaii
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Josh Green', 'josh-green', 'HI', 'governor', 'democrat', 'Governor of Hawaii', 2022, '9th Governor of Hawaii. Emergency room physician and former Lieutenant Governor.', 'https://governor.hawaii.gov', null, 'https://en.wikipedia.org/wiki/Josh_Green', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

-- Idaho
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Brad Little', 'brad-little', 'ID', 'governor', 'republican', 'Governor of Idaho', 2019, '33rd Governor of Idaho. Former Lieutenant Governor and rancher.', 'https://gov.idaho.gov', null, 'https://en.wikipedia.org/wiki/Brad_Little', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

-- Illinois
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('JB Pritzker', 'jb-pritzker', 'IL', 'governor', 'democrat', 'Governor of Illinois', 2019, '43rd Governor of Illinois. Businessman, philanthropist, and member of the Pritzker family.', 'https://www.illinois.gov/government/governor.html', null, 'https://en.wikipedia.org/wiki/J._B._Pritzker', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

-- Indiana
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Mike Braun', 'mike-braun', 'IN', 'governor', 'republican', 'Governor of Indiana', 2025, '52nd Governor of Indiana. Former U.S. Senator and businessman.', 'https://www.in.gov/gov', null, 'https://en.wikipedia.org/wiki/Mike_Braun', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

-- Iowa
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Kim Reynolds', 'kim-reynolds', 'IA', 'governor', 'republican', 'Governor of Iowa', 2017, '43rd Governor of Iowa. First woman to serve as Governor of Iowa.', 'https://governor.iowa.gov', null, 'https://en.wikipedia.org/wiki/Kim_Reynolds', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

-- Kansas
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Laura Kelly', 'laura-kelly', 'KS', 'governor', 'democrat', 'Governor of Kansas', 2019, '48th Governor of Kansas. Former state senator.', 'https://governor.kansas.gov', null, 'https://en.wikipedia.org/wiki/Laura_Kelly', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

-- Kentucky
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Andy Beshear', 'andy-beshear', 'KY', 'governor', 'democrat', 'Governor of Kentucky', 2019, '63rd Governor of Kentucky. Former Attorney General and son of former Governor Steve Beshear.', 'https://governor.ky.gov', null, 'https://en.wikipedia.org/wiki/Andy_Beshear', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

-- Louisiana
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Jeff Landry', 'jeff-landry', 'LA', 'governor', 'republican', 'Governor of Louisiana', 2024, '57th Governor of Louisiana. Former Attorney General of Louisiana.', 'https://gov.louisiana.gov', null, 'https://en.wikipedia.org/wiki/Jeff_Landry', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

-- Maine
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Janet Mills', 'janet-mills', 'ME', 'governor', 'democrat', 'Governor of Maine', 2019, '75th Governor of Maine. First woman to serve as Governor of Maine.', 'https://www.maine.gov/governor', null, 'https://en.wikipedia.org/wiki/Janet_Mills', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

-- Maryland
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Wes Moore', 'wes-moore', 'MD', 'governor', 'democrat', 'Governor of Maryland', 2023, '63rd Governor of Maryland. First African-American governor of Maryland. Best-selling author and Army veteran.', 'https://governor.maryland.gov', null, 'https://en.wikipedia.org/wiki/Wes_Moore', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

-- Massachusetts
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Maura Healey', 'maura-healey', 'MA', 'governor', 'democrat', 'Governor of Massachusetts', 2023, '73rd Governor of Massachusetts. First openly lesbian governor in U.S. history.', 'https://www.mass.gov/governor', null, 'https://en.wikipedia.org/wiki/Maura_Healey', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

-- Michigan
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Gretchen Whitmer', 'gretchen-whitmer', 'MI', 'governor', 'democrat', 'Governor of Michigan', 2019, '49th Governor of Michigan. Former state legislator and prosecutor.', 'https://www.michigan.gov/whitmer', null, 'https://en.wikipedia.org/wiki/Gretchen_Whitmer', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

-- Minnesota
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Tim Walz', 'tim-walz', 'MN', 'governor', 'democrat', 'Governor of Minnesota', 2019, '40th Governor of Minnesota. Former U.S. Representative and high school teacher. 2024 Democratic VP nominee.', 'https://mn.gov/governor', null, 'https://en.wikipedia.org/wiki/Tim_Walz', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

-- Mississippi
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Tate Reeves', 'tate-reeves', 'MS', 'governor', 'republican', 'Governor of Mississippi', 2020, '65th Governor of Mississippi. Former Lieutenant Governor and State Treasurer.', 'https://governorreeves.ms.gov', null, 'https://en.wikipedia.org/wiki/Tate_Reeves', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

-- Missouri
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Mike Kehoe', 'mike-kehoe', 'MO', 'governor', 'republican', 'Governor of Missouri', 2025, '58th Governor of Missouri. Former Lieutenant Governor.', 'https://governor.mo.gov', null, 'https://en.wikipedia.org/wiki/Mike_Kehoe', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

-- Montana
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Greg Gianforte', 'greg-gianforte', 'MT', 'governor', 'republican', 'Governor of Montana', 2021, '25th Governor of Montana. Tech entrepreneur and former U.S. Representative.', 'https://governor.mt.gov', null, 'https://en.wikipedia.org/wiki/Greg_Gianforte', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

-- Nebraska
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Jim Pillen', 'jim-pillen', 'NE', 'governor', 'republican', 'Governor of Nebraska', 2023, '41st Governor of Nebraska. Veterinarian and hog farmer.', 'https://governor.nebraska.gov', null, 'https://en.wikipedia.org/wiki/Jim_Pillen', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

-- Nevada
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Joe Lombardo', 'joe-lombardo', 'NV', 'governor', 'republican', 'Governor of Nevada', 2023, '31st Governor of Nevada. Former Clark County Sheriff.', 'https://gov.nv.gov', null, 'https://en.wikipedia.org/wiki/Joe_Lombardo', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

-- New Hampshire
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Kelly Ayotte', 'kelly-ayotte', 'NH', 'governor', 'republican', 'Governor of New Hampshire', 2025, '83rd Governor of New Hampshire. Former U.S. Senator and Attorney General of New Hampshire.', 'https://www.governor.nh.gov', null, 'https://en.wikipedia.org/wiki/Kelly_Ayotte', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

-- New Jersey
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Phil Murphy', 'phil-murphy', 'NJ', 'governor', 'democrat', 'Governor of New Jersey', 2018, '56th Governor of New Jersey. Former U.S. Ambassador to Germany and Goldman Sachs executive.', 'https://www.nj.gov/governor', null, 'https://en.wikipedia.org/wiki/Phil_Murphy', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

-- New Mexico
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Michelle Lujan Grisham', 'michelle-lujan-grisham', 'NM', 'governor', 'democrat', 'Governor of New Mexico', 2019, '32nd Governor of New Mexico. Former U.S. Representative and state Health Secretary.', 'https://www.governor.state.nm.us', null, 'https://en.wikipedia.org/wiki/Michelle_Lujan_Grisham', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

-- New York
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Kathy Hochul', 'kathy-hochul', 'NY', 'governor', 'democrat', 'Governor of New York', 2021, '57th Governor of New York. First woman to serve as Governor of New York.', 'https://www.governor.ny.gov', null, 'https://en.wikipedia.org/wiki/Kathy_Hochul', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

-- North Carolina
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Josh Stein', 'josh-stein', 'NC', 'governor', 'democrat', 'Governor of North Carolina', 2025, '76th Governor of North Carolina. Former Attorney General of North Carolina.', 'https://governor.nc.gov', null, 'https://en.wikipedia.org/wiki/Josh_Stein', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

-- North Dakota
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Kelly Armstrong', 'kelly-armstrong', 'ND', 'governor', 'republican', 'Governor of North Dakota', 2024, '34th Governor of North Dakota. Former U.S. Representative and state senator.', 'https://www.governor.nd.gov', null, 'https://en.wikipedia.org/wiki/Kelly_Armstrong', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

-- Ohio
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Mike DeWine', 'mike-dewine', 'OH', 'governor', 'republican', 'Governor of Ohio', 2019, '70th Governor of Ohio. Former U.S. Senator, Lieutenant Governor, and Attorney General.', 'https://governor.ohio.gov', null, 'https://en.wikipedia.org/wiki/Mike_DeWine', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

-- Oklahoma
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Kevin Stitt', 'kevin-stitt', 'OK', 'governor', 'republican', 'Governor of Oklahoma', 2019, '28th Governor of Oklahoma. Businessman and Cherokee Nation citizen.', 'https://www.governor.ok.gov', null, 'https://en.wikipedia.org/wiki/Kevin_Stitt', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

-- Oregon
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Tina Kotek', 'tina-kotek', 'OR', 'governor', 'democrat', 'Governor of Oregon', 2023, '38th Governor of Oregon. Former Speaker of the Oregon House of Representatives.', 'https://www.oregon.gov/governor', null, 'https://en.wikipedia.org/wiki/Tina_Kotek', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

-- Pennsylvania
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Josh Shapiro', 'josh-shapiro', 'PA', 'governor', 'democrat', 'Governor of Pennsylvania', 2023, '48th Governor of Pennsylvania. Former Attorney General of Pennsylvania.', 'https://www.governor.pa.gov', null, 'https://en.wikipedia.org/wiki/Josh_Shapiro', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

-- Rhode Island
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Dan McKee', 'dan-mckee', 'RI', 'governor', 'democrat', 'Governor of Rhode Island', 2021, '76th Governor of Rhode Island. Former Lieutenant Governor.', 'https://governor.ri.gov', null, 'https://en.wikipedia.org/wiki/Dan_McKee', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

-- South Carolina
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Henry McMaster', 'henry-mcmaster', 'SC', 'governor', 'republican', 'Governor of South Carolina', 2017, '117th Governor of South Carolina. Former Attorney General and Lieutenant Governor.', 'https://governor.sc.gov', null, 'https://en.wikipedia.org/wiki/Henry_McMaster', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

-- South Dakota
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Kristi Noem', 'kristi-noem', 'SD', 'governor', 'republican', 'Governor of South Dakota', 2019, '33rd Governor of South Dakota. Former U.S. Representative and state legislator.', 'https://sd.gov/governor', null, 'https://en.wikipedia.org/wiki/Kristi_Noem', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

-- Tennessee
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Bill Lee', 'bill-lee', 'TN', 'governor', 'republican', 'Governor of Tennessee', 2019, '50th Governor of Tennessee. Businessman and rancher with no prior political experience.', 'https://www.tn.gov/governor', null, 'https://en.wikipedia.org/wiki/Bill_Lee_(politician)', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

-- Texas
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Greg Abbott', 'greg-abbott', 'TX', 'governor', 'republican', 'Governor of Texas', 2015, '48th Governor of Texas. Former Attorney General of Texas.', 'https://gov.texas.gov', null, 'https://en.wikipedia.org/wiki/Greg_Abbott', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

-- Utah
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Spencer Cox', 'spencer-cox', 'UT', 'governor', 'republican', 'Governor of Utah', 2021, '18th Governor of Utah. Former Lieutenant Governor.', 'https://governor.utah.gov', null, 'https://en.wikipedia.org/wiki/Spencer_Cox_(politician)', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

-- Vermont
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Phil Scott', 'phil-scott', 'VT', 'governor', 'republican', 'Governor of Vermont', 2017, '82nd Governor of Vermont. Known as a moderate Republican in a blue state.', 'https://governor.vermont.gov', null, 'https://en.wikipedia.org/wiki/Phil_Scott_(politician)', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

-- Virginia
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Glenn Youngkin', 'glenn-youngkin', 'VA', 'governor', 'republican', 'Governor of Virginia', 2022, '74th Governor of Virginia. Former co-CEO of the Carlyle Group.', 'https://www.governor.virginia.gov', null, 'https://en.wikipedia.org/wiki/Glenn_Youngkin', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

-- Washington
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Bob Ferguson', 'bob-ferguson', 'WA', 'governor', 'democrat', 'Governor of Washington', 2025, '24th Governor of Washington. Former Attorney General of Washington.', 'https://www.governor.wa.gov', null, 'https://en.wikipedia.org/wiki/Bob_Ferguson_(politician)', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

-- West Virginia
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Patrick Morrisey', 'patrick-morrisey', 'WV', 'governor', 'republican', 'Governor of West Virginia', 2025, '37th Governor of West Virginia. Former Attorney General of West Virginia.', 'https://governor.wv.gov', null, 'https://en.wikipedia.org/wiki/Patrick_Morrisey', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

-- Wisconsin
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Tony Evers', 'tony-evers', 'WI', 'governor', 'democrat', 'Governor of Wisconsin', 2019, '46th Governor of Wisconsin. Former State Superintendent of Public Instruction.', 'https://evers.wi.gov', null, 'https://en.wikipedia.org/wiki/Tony_Evers', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

-- Wyoming
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Mark Gordon', 'mark-gordon', 'WY', 'governor', 'republican', 'Governor of Wyoming', 2019, '33rd Governor of Wyoming. Former State Treasurer and rancher.', 'https://governor.wyo.gov', null, 'https://en.wikipedia.org/wiki/Mark_Gordon', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

-- ============================================================
-- U.S. HOUSE REPRESENTATIVES (Top 100 Notable Members)
-- ============================================================

-- Leadership
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Mike Johnson', 'mike-johnson', 'LA', 'house', 'republican', 'Speaker of the House', 2017, '56th Speaker of the United States House of Representatives. Represents Louisiana''s 4th district.', 'https://mikejohnson.house.gov', null, 'https://en.wikipedia.org/wiki/Mike_Johnson', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Hakeem Jeffries', 'hakeem-jeffries', 'NY', 'house', 'democrat', 'House Minority Leader', 2013, 'House Minority Leader. U.S. Representative for New York''s 8th district.', 'https://jeffries.house.gov', null, 'https://en.wikipedia.org/wiki/Hakeem_Jeffries', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Steve Scalise', 'steve-scalise', 'LA', 'house', 'republican', 'House Majority Leader', 2008, 'House Majority Leader. U.S. Representative for Louisiana''s 1st district.', 'https://scalise.house.gov', null, 'https://en.wikipedia.org/wiki/Steve_Scalise', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Tom Emmer', 'tom-emmer', 'MN', 'house', 'republican', 'House Majority Whip', 2015, 'House Majority Whip. U.S. Representative for Minnesota''s 6th district.', 'https://emmer.house.gov', null, 'https://en.wikipedia.org/wiki/Tom_Emmer', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Katherine Clark', 'katherine-clark', 'MA', 'house', 'democrat', 'House Minority Whip', 2013, 'House Minority Whip. U.S. Representative for Massachusetts'' 5th district.', 'https://katherineclark.house.gov', null, 'https://en.wikipedia.org/wiki/Katherine_Clark', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Pete Aguilar', 'pete-aguilar', 'CA', 'house', 'democrat', 'U.S. Representative', 2015, 'Chair of the House Democratic Caucus. U.S. Representative for California''s 33rd district.', 'https://aguilar.house.gov', null, 'https://en.wikipedia.org/wiki/Pete_Aguilar', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

-- High-profile Republicans
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Marjorie Taylor Greene', 'marjorie-taylor-greene', 'GA', 'house', 'republican', 'U.S. Representative', 2021, 'U.S. Representative for Georgia''s 14th district. Prominent conservative firebrand.', 'https://greene.house.gov', null, 'https://en.wikipedia.org/wiki/Marjorie_Taylor_Greene', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Jim Jordan', 'jim-jordan', 'OH', 'house', 'republican', 'U.S. Representative', 2007, 'Chairman of the House Judiciary Committee. U.S. Representative for Ohio''s 4th district.', 'https://jordan.house.gov', null, 'https://en.wikipedia.org/wiki/Jim_Jordan_(American_politician)', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Matt Gaetz', 'matt-gaetz', 'FL', 'house', 'republican', 'U.S. Representative', 2017, 'U.S. Representative for Florida''s 1st district. Prominent conservative and Trump ally.', 'https://gaetz.house.gov', null, 'https://en.wikipedia.org/wiki/Matt_Gaetz', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Lauren Boebert', 'lauren-boebert', 'CO', 'house', 'republican', 'U.S. Representative', 2021, 'U.S. Representative for Colorado''s 4th district. Former restaurateur and conservative activist.', 'https://boebert.house.gov', null, 'https://en.wikipedia.org/wiki/Lauren_Boebert', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Kevin McCarthy', 'kevin-mccarthy', 'CA', 'house', 'republican', 'U.S. Representative', 2007, 'U.S. Representative for California''s 20th district. Former Speaker of the House.', 'https://kevinmccarthy.house.gov', null, 'https://en.wikipedia.org/wiki/Kevin_McCarthy', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Elise Stefanik', 'elise-stefanik', 'NY', 'house', 'republican', 'U.S. Representative', 2015, 'U.S. Representative for New York''s 21st district. Former House Republican Conference Chair.', 'https://stefanik.house.gov', null, 'https://en.wikipedia.org/wiki/Elise_Stefanik', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Byron Donalds', 'byron-donalds', 'FL', 'house', 'republican', 'U.S. Representative', 2021, 'U.S. Representative for Florida''s 19th district. Member of the House Freedom Caucus.', 'https://donalds.house.gov', null, 'https://en.wikipedia.org/wiki/Byron_Donalds', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Dan Crenshaw', 'dan-crenshaw', 'TX', 'house', 'republican', 'U.S. Representative', 2019, 'U.S. Representative for Texas'' 2nd district. Former Navy SEAL who lost an eye in Afghanistan.', 'https://crenshaw.house.gov', null, 'https://en.wikipedia.org/wiki/Dan_Crenshaw', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Andy Biggs', 'andy-biggs', 'AZ', 'house', 'republican', 'U.S. Representative', 2017, 'U.S. Representative for Arizona''s 5th district. Former chair of the House Freedom Caucus.', 'https://biggs.house.gov', null, 'https://en.wikipedia.org/wiki/Andy_Biggs', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Paul Gosar', 'paul-gosar', 'AZ', 'house', 'republican', 'U.S. Representative', 2011, 'U.S. Representative for Arizona''s 9th district. Dentist and conservative activist.', 'https://gosar.house.gov', null, 'https://en.wikipedia.org/wiki/Paul_Gosar', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Chip Roy', 'chip-roy', 'TX', 'house', 'republican', 'U.S. Representative', 2019, 'U.S. Representative for Texas'' 21st district. Former chief of staff to Senator Ted Cruz.', 'https://roy.house.gov', null, 'https://en.wikipedia.org/wiki/Chip_Roy', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Nancy Mace', 'nancy-mace', 'SC', 'house', 'republican', 'U.S. Representative', 2021, 'U.S. Representative for South Carolina''s 1st district. First woman to graduate from The Citadel.', 'https://mace.house.gov', null, 'https://en.wikipedia.org/wiki/Nancy_Mace', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Michael McCaul', 'michael-mccaul', 'TX', 'house', 'republican', 'U.S. Representative', 2005, 'Chairman of the House Foreign Affairs Committee. U.S. Representative for Texas'' 10th district.', 'https://mccaul.house.gov', null, 'https://en.wikipedia.org/wiki/Michael_McCaul', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Patrick McHenry', 'patrick-mchenry', 'NC', 'house', 'republican', 'U.S. Representative', 2005, 'U.S. Representative for North Carolina''s 10th district. Former chair of House Financial Services Committee.', 'https://mchenry.house.gov', null, 'https://en.wikipedia.org/wiki/Patrick_McHenry', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Jason Smith', 'jason-smith', 'MO', 'house', 'republican', 'U.S. Representative', 2013, 'Chairman of the House Ways and Means Committee. U.S. Representative for Missouri''s 8th district.', 'https://jasonsmith.house.gov', null, 'https://en.wikipedia.org/wiki/Jason_Smith_(politician)', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Jodey Arrington', 'jodey-arrington', 'TX', 'house', 'republican', 'U.S. Representative', 2017, 'Chairman of the House Budget Committee. U.S. Representative for Texas'' 19th district.', 'https://arrington.house.gov', null, 'https://en.wikipedia.org/wiki/Jodey_Arrington', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Mike Rogers', 'mike-rogers-al', 'AL', 'house', 'republican', 'U.S. Representative', 2003, 'Chairman of the House Armed Services Committee. U.S. Representative for Alabama''s 3rd district.', 'https://mikerogers.house.gov', null, 'https://en.wikipedia.org/wiki/Mike_Rogers_(Alabama_politician)', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Mark Green', 'mark-green', 'TN', 'house', 'republican', 'U.S. Representative', 2019, 'Chairman of the House Homeland Security Committee. U.S. Representative for Tennessee''s 7th district.', 'https://markgreen.house.gov', null, 'https://en.wikipedia.org/wiki/Mark_Green_(politician)', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('James Comer', 'james-comer', 'KY', 'house', 'republican', 'U.S. Representative', 2016, 'Chairman of the House Oversight Committee. U.S. Representative for Kentucky''s 1st district.', 'https://comer.house.gov', null, 'https://en.wikipedia.org/wiki/James_Comer', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Virginia Foxx', 'virginia-foxx', 'NC', 'house', 'republican', 'U.S. Representative', 2005, 'Chair of the House Education and Workforce Committee. U.S. Representative for North Carolina''s 5th district.', 'https://foxx.house.gov', null, 'https://en.wikipedia.org/wiki/Virginia_Foxx', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Sam Graves', 'sam-graves', 'MO', 'house', 'republican', 'U.S. Representative', 2001, 'Chairman of the House Transportation and Infrastructure Committee. Represents Missouri''s 6th district.', 'https://graves.house.gov', null, 'https://en.wikipedia.org/wiki/Sam_Graves', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Cathy McMorris Rodgers', 'cathy-mcmorris-rodgers', 'WA', 'house', 'republican', 'U.S. Representative', 2005, 'Chair of the House Energy and Commerce Committee. U.S. Representative for Washington''s 5th district.', 'https://mcmorris.house.gov', null, 'https://en.wikipedia.org/wiki/Cathy_McMorris_Rodgers', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Mike Turner', 'mike-turner', 'OH', 'house', 'republican', 'U.S. Representative', 2003, 'Chairman of the House Intelligence Committee. U.S. Representative for Ohio''s 10th district.', 'https://turner.house.gov', null, 'https://en.wikipedia.org/wiki/Mike_Turner', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Bob Good', 'bob-good', 'VA', 'house', 'republican', 'U.S. Representative', 2021, 'U.S. Representative for Virginia''s 5th district. Former chair of the House Freedom Caucus.', 'https://good.house.gov', null, 'https://en.wikipedia.org/wiki/Bob_Good', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Anna Paulina Luna', 'anna-paulina-luna', 'FL', 'house', 'republican', 'U.S. Representative', 2023, 'U.S. Representative for Florida''s 13th district. Air Force veteran.', 'https://luna.house.gov', null, 'https://en.wikipedia.org/wiki/Anna_Paulina_Luna', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Wesley Hunt', 'wesley-hunt', 'TX', 'house', 'republican', 'U.S. Representative', 2023, 'U.S. Representative for Texas'' 38th district. Army veteran and Apache helicopter pilot.', 'https://hunt.house.gov', null, 'https://en.wikipedia.org/wiki/Wesley_Hunt', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Mike Waltz', 'mike-waltz', 'FL', 'house', 'republican', 'U.S. Representative', 2019, 'U.S. Representative for Florida''s 6th district. Green Beret and national security commentator.', 'https://waltz.house.gov', null, 'https://en.wikipedia.org/wiki/Michael_Waltz', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Thomas Massie', 'thomas-massie', 'KY', 'house', 'republican', 'U.S. Representative', 2012, 'U.S. Representative for Kentucky''s 4th district. MIT-educated engineer and libertarian-leaning Republican.', 'https://massie.house.gov', null, 'https://en.wikipedia.org/wiki/Thomas_Massie', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

-- High-profile Democrats
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Alexandria Ocasio-Cortez', 'alexandria-ocasio-cortez', 'NY', 'house', 'democrat', 'U.S. Representative', 2019, 'U.S. Representative for New York''s 14th district. Prominent progressive and Squad member.', 'https://ocasio-cortez.house.gov', null, 'https://en.wikipedia.org/wiki/Alexandria_Ocasio-Cortez', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Nancy Pelosi', 'nancy-pelosi', 'CA', 'house', 'democrat', 'U.S. Representative', 1987, 'U.S. Representative for California''s 11th district. Former Speaker of the House.', 'https://pelosi.house.gov', null, 'https://en.wikipedia.org/wiki/Nancy_Pelosi', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Jim Clyburn', 'jim-clyburn', 'SC', 'house', 'democrat', 'U.S. Representative', 1993, 'U.S. Representative for South Carolina''s 6th district. Former House Majority Whip and Assistant Leader.', 'https://clyburn.house.gov', null, 'https://en.wikipedia.org/wiki/Jim_Clyburn', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Ilhan Omar', 'ilhan-omar', 'MN', 'house', 'democrat', 'U.S. Representative', 2019, 'U.S. Representative for Minnesota''s 5th district. First Somali-American elected to Congress.', 'https://omar.house.gov', null, 'https://en.wikipedia.org/wiki/Ilhan_Omar', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Rashida Tlaib', 'rashida-tlaib', 'MI', 'house', 'democrat', 'U.S. Representative', 2019, 'U.S. Representative for Michigan''s 12th district. First Palestinian-American woman in Congress.', 'https://tlaib.house.gov', null, 'https://en.wikipedia.org/wiki/Rashida_Tlaib', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Ayanna Pressley', 'ayanna-pressley', 'MA', 'house', 'democrat', 'U.S. Representative', 2019, 'U.S. Representative for Massachusetts'' 7th district. First Black woman elected to Congress from Massachusetts.', 'https://pressley.house.gov', null, 'https://en.wikipedia.org/wiki/Ayanna_Pressley', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Ro Khanna', 'ro-khanna', 'CA', 'house', 'democrat', 'U.S. Representative', 2017, 'U.S. Representative for California''s 17th district. Progressive representing Silicon Valley.', 'https://khanna.house.gov', null, 'https://en.wikipedia.org/wiki/Ro_Khanna', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Jamie Raskin', 'jamie-raskin', 'MD', 'house', 'democrat', 'U.S. Representative', 2017, 'U.S. Representative for Maryland''s 8th district. Constitutional law professor and lead impeachment manager.', 'https://raskin.house.gov', null, 'https://en.wikipedia.org/wiki/Jamie_Raskin', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Maxine Waters', 'maxine-waters', 'CA', 'house', 'democrat', 'U.S. Representative', 1991, 'U.S. Representative for California''s 43rd district. Ranking member of the Financial Services Committee.', 'https://waters.house.gov', null, 'https://en.wikipedia.org/wiki/Maxine_Waters', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Jerry Nadler', 'jerry-nadler', 'NY', 'house', 'democrat', 'U.S. Representative', 1992, 'U.S. Representative for New York''s 12th district. Ranking member of the House Judiciary Committee.', 'https://nadler.house.gov', null, 'https://en.wikipedia.org/wiki/Jerry_Nadler', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Adam Smith', 'adam-smith', 'WA', 'house', 'democrat', 'U.S. Representative', 1997, 'U.S. Representative for Washington''s 9th district. Ranking member of the Armed Services Committee.', 'https://adamsmith.house.gov', null, 'https://en.wikipedia.org/wiki/Adam_Smith_(politician)', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Pramila Jayapal', 'pramila-jayapal', 'WA', 'house', 'democrat', 'U.S. Representative', 2017, 'U.S. Representative for Washington''s 7th district. Chair of the Congressional Progressive Caucus.', 'https://jayapal.house.gov', null, 'https://en.wikipedia.org/wiki/Pramila_Jayapal', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Gregory Meeks', 'gregory-meeks', 'NY', 'house', 'democrat', 'U.S. Representative', 1998, 'U.S. Representative for New York''s 5th district. Ranking member of the Foreign Affairs Committee.', 'https://meeks.house.gov', null, 'https://en.wikipedia.org/wiki/Gregory_Meeks', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Steny Hoyer', 'steny-hoyer', 'MD', 'house', 'democrat', 'U.S. Representative', 1981, 'U.S. Representative for Maryland''s 5th district. Former House Majority Leader.', 'https://hoyer.house.gov', null, 'https://en.wikipedia.org/wiki/Steny_Hoyer', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Debbie Wasserman Schultz', 'debbie-wasserman-schultz', 'FL', 'house', 'democrat', 'U.S. Representative', 2005, 'U.S. Representative for Florida''s 25th district. Former chair of the Democratic National Committee.', 'https://wassermanschultz.house.gov', null, 'https://en.wikipedia.org/wiki/Debbie_Wasserman_Schultz', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Ted Lieu', 'ted-lieu', 'CA', 'house', 'democrat', 'U.S. Representative', 2015, 'U.S. Representative for California''s 36th district. Air Force Reserve colonel.', 'https://lieu.house.gov', null, 'https://en.wikipedia.org/wiki/Ted_Lieu', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Eric Swalwell', 'eric-swalwell', 'CA', 'house', 'democrat', 'U.S. Representative', 2013, 'U.S. Representative for California''s 14th district. Member of the Intelligence and Judiciary Committees.', 'https://swalwell.house.gov', null, 'https://en.wikipedia.org/wiki/Eric_Swalwell', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Ritchie Torres', 'ritchie-torres', 'NY', 'house', 'democrat', 'U.S. Representative', 2021, 'U.S. Representative for New York''s 15th district. One of the first openly gay Afro-Latino members of Congress.', 'https://torres.house.gov', null, 'https://en.wikipedia.org/wiki/Ritchie_Torres', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Jasmine Crockett', 'jasmine-crockett', 'TX', 'house', 'democrat', 'U.S. Representative', 2023, 'U.S. Representative for Texas'' 30th district. Attorney and former state representative.', 'https://crockett.house.gov', null, 'https://en.wikipedia.org/wiki/Jasmine_Crockett', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Maxwell Frost', 'maxwell-frost', 'FL', 'house', 'democrat', 'U.S. Representative', 2023, 'U.S. Representative for Florida''s 10th district. First Gen Z member of Congress.', 'https://frost.house.gov', null, 'https://en.wikipedia.org/wiki/Maxwell_Frost', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Jared Moskowitz', 'jared-moskowitz', 'FL', 'house', 'democrat', 'U.S. Representative', 2023, 'U.S. Representative for Florida''s 23rd district. Former director of Florida Division of Emergency Management.', 'https://moskowitz.house.gov', null, 'https://en.wikipedia.org/wiki/Jared_Moskowitz', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Robert Garcia', 'robert-garcia', 'CA', 'house', 'democrat', 'U.S. Representative', 2023, 'U.S. Representative for California''s 42nd district. Former Mayor of Long Beach.', 'https://robertgarcia.house.gov', null, 'https://en.wikipedia.org/wiki/Robert_Garcia_(politician)', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

-- Additional notable members from both parties
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Liz Cheney', 'liz-cheney', 'WY', 'house', 'republican', 'Former U.S. Representative', 2017, 'Former U.S. Representative for Wyoming. Vice Chair of the January 6th Committee. Daughter of VP Dick Cheney.', 'https://cheney.house.gov', null, 'https://en.wikipedia.org/wiki/Liz_Cheney', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Joaquin Castro', 'joaquin-castro', 'TX', 'house', 'democrat', 'U.S. Representative', 2013, 'U.S. Representative for Texas'' 20th district. Twin brother of Julian Castro.', 'https://castro.house.gov', null, 'https://en.wikipedia.org/wiki/Joaquin_Castro', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Tony Gonzales', 'tony-gonzales', 'TX', 'house', 'republican', 'U.S. Representative', 2021, 'U.S. Representative for Texas'' 23rd district. Navy veteran representing a large border district.', 'https://gonzales.house.gov', null, 'https://en.wikipedia.org/wiki/Tony_Gonzales', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Don Bacon', 'don-bacon', 'NE', 'house', 'republican', 'U.S. Representative', 2017, 'U.S. Representative for Nebraska''s 2nd district. Retired Air Force brigadier general.', 'https://bacon.house.gov', null, 'https://en.wikipedia.org/wiki/Don_Bacon', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Brian Fitzpatrick', 'brian-fitzpatrick', 'PA', 'house', 'republican', 'U.S. Representative', 2017, 'U.S. Representative for Pennsylvania''s 1st district. Former FBI special agent. Known as a moderate.', 'https://fitzpatrick.house.gov', null, 'https://en.wikipedia.org/wiki/Brian_Fitzpatrick_(politician)', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Josh Gottheimer', 'josh-gottheimer', 'NJ', 'house', 'democrat', 'U.S. Representative', 2017, 'U.S. Representative for New Jersey''s 5th district. Co-chair of the bipartisan Problem Solvers Caucus.', 'https://gottheimer.house.gov', null, 'https://en.wikipedia.org/wiki/Josh_Gottheimer', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Abigail Spanberger', 'abigail-spanberger', 'VA', 'house', 'democrat', 'U.S. Representative', 2019, 'U.S. Representative for Virginia''s 7th district. Former CIA operations officer.', 'https://spanberger.house.gov', null, 'https://en.wikipedia.org/wiki/Abigail_Spanberger', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Mikie Sherrill', 'mikie-sherrill', 'NJ', 'house', 'democrat', 'U.S. Representative', 2019, 'U.S. Representative for New Jersey''s 11th district. Former Navy helicopter pilot and federal prosecutor.', 'https://sherrill.house.gov', null, 'https://en.wikipedia.org/wiki/Mikie_Sherrill', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Veronica Escobar', 'veronica-escobar', 'TX', 'house', 'democrat', 'U.S. Representative', 2019, 'U.S. Representative for Texas'' 16th district. First Latina to represent El Paso in Congress.', 'https://escobar.house.gov', null, 'https://en.wikipedia.org/wiki/Veronica_Escobar', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Frederica Wilson', 'frederica-wilson', 'FL', 'house', 'democrat', 'U.S. Representative', 2011, 'U.S. Representative for Florida''s 24th district. Known for her colorful cowboy hats.', 'https://wilson.house.gov', null, 'https://en.wikipedia.org/wiki/Frederica_Wilson', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Suzan DelBene', 'suzan-delbene', 'WA', 'house', 'democrat', 'U.S. Representative', 2012, 'U.S. Representative for Washington''s 1st district. Chair of the Democratic Congressional Campaign Committee.', 'https://delbene.house.gov', null, 'https://en.wikipedia.org/wiki/Suzan_DelBene', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Cori Bush', 'cori-bush', 'MO', 'house', 'democrat', 'U.S. Representative', 2021, 'U.S. Representative for Missouri''s 1st district. Nurse, pastor, and activist.', 'https://bush.house.gov', null, 'https://en.wikipedia.org/wiki/Cori_Bush', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Sheila Jackson Lee', 'sheila-jackson-lee', 'TX', 'house', 'democrat', 'U.S. Representative', 1995, 'U.S. Representative for Texas'' 18th district. Senior member of the Judiciary and Homeland Security Committees.', 'https://jacksonlee.house.gov', null, 'https://en.wikipedia.org/wiki/Sheila_Jackson_Lee', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Mark Takano', 'mark-takano', 'CA', 'house', 'democrat', 'U.S. Representative', 2013, 'U.S. Representative for California''s 39th district. Ranking member of the Veterans Affairs Committee.', 'https://takano.house.gov', null, 'https://en.wikipedia.org/wiki/Mark_Takano', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Barbara Lee', 'barbara-lee', 'CA', 'house', 'democrat', 'U.S. Representative', 1998, 'U.S. Representative for California''s 12th district. Only member of Congress to vote against the 2001 AUMF.', 'https://lee.house.gov', null, 'https://en.wikipedia.org/wiki/Barbara_Lee', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

-- More Republican members
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Ralph Norman', 'ralph-norman', 'SC', 'house', 'republican', 'U.S. Representative', 2017, 'U.S. Representative for South Carolina''s 5th district. Member of the House Freedom Caucus.', 'https://norman.house.gov', null, 'https://en.wikipedia.org/wiki/Ralph_Norman', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Scott Perry', 'scott-perry', 'PA', 'house', 'republican', 'U.S. Representative', 2013, 'U.S. Representative for Pennsylvania''s 10th district. Former chair of the House Freedom Caucus.', 'https://perry.house.gov', null, 'https://en.wikipedia.org/wiki/Scott_Perry_(politician)', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Barry Loudermilk', 'barry-loudermilk', 'GA', 'house', 'republican', 'U.S. Representative', 2015, 'U.S. Representative for Georgia''s 11th district. Chairman of the House Administration Committee.', 'https://loudermilk.house.gov', null, 'https://en.wikipedia.org/wiki/Barry_Loudermilk', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Troy Nehls', 'troy-nehls', 'TX', 'house', 'republican', 'U.S. Representative', 2021, 'U.S. Representative for Texas'' 22nd district. Former Fort Bend County Sheriff.', 'https://nehls.house.gov', null, 'https://en.wikipedia.org/wiki/Troy_Nehls', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Beth Van Duyne', 'beth-van-duyne', 'TX', 'house', 'republican', 'U.S. Representative', 2021, 'U.S. Representative for Texas'' 24th district. Former Mayor of Irving, Texas.', 'https://vanduyne.house.gov', null, 'https://en.wikipedia.org/wiki/Beth_Van_Duyne', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Maria Elvira Salazar', 'maria-elvira-salazar', 'FL', 'house', 'republican', 'U.S. Representative', 2021, 'U.S. Representative for Florida''s 27th district. Former journalist and TV anchor.', 'https://salazar.house.gov', null, 'https://en.wikipedia.org/wiki/Maria_Elvira_Salazar', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Carlos Gimenez', 'carlos-gimenez', 'FL', 'house', 'republican', 'U.S. Representative', 2021, 'U.S. Representative for Florida''s 28th district. Former Mayor of Miami-Dade County.', 'https://gimenez.house.gov', null, 'https://en.wikipedia.org/wiki/Carlos_A._Gimenez', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Mike Garcia', 'mike-garcia', 'CA', 'house', 'republican', 'U.S. Representative', 2020, 'U.S. Representative for California''s 27th district. Former Navy fighter pilot.', 'https://mikegarcia.house.gov', null, 'https://en.wikipedia.org/wiki/Mike_Garcia_(politician)', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Young Kim', 'young-kim', 'CA', 'house', 'republican', 'U.S. Representative', 2021, 'U.S. Representative for California''s 40th district. First Korean-American woman elected to Congress.', 'https://youngkim.house.gov', null, 'https://en.wikipedia.org/wiki/Young_Kim', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Nicole Malliotakis', 'nicole-malliotakis', 'NY', 'house', 'republican', 'U.S. Representative', 2021, 'U.S. Representative for New York''s 11th district. Represents Staten Island and part of Brooklyn.', 'https://malliotakis.house.gov', null, 'https://en.wikipedia.org/wiki/Nicole_Malliotakis', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Mike Lawler', 'mike-lawler', 'NY', 'house', 'republican', 'U.S. Representative', 2023, 'U.S. Representative for New York''s 17th district. Moderate Republican in a swing district.', 'https://lawler.house.gov', null, 'https://en.wikipedia.org/wiki/Mike_Lawler', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Nick LaLota', 'nick-lalota', 'NY', 'house', 'republican', 'U.S. Representative', 2023, 'U.S. Representative for New York''s 1st district. Navy veteran.', 'https://lalota.house.gov', null, 'https://en.wikipedia.org/wiki/Nick_LaLota', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Brandon Williams', 'brandon-williams', 'NY', 'house', 'republican', 'U.S. Representative', 2023, 'U.S. Representative for New York''s 22nd district. Marine veteran and tech entrepreneur.', 'https://williams.house.gov', null, 'https://en.wikipedia.org/wiki/Brandon_Williams_(politician)', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

-- More Democrats
insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Joe Neguse', 'joe-neguse', 'CO', 'house', 'democrat', 'U.S. Representative', 2019, 'U.S. Representative for Colorado''s 2nd district. Assistant Democratic Leader.', 'https://neguse.house.gov', null, 'https://en.wikipedia.org/wiki/Joe_Neguse', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Jim McGovern', 'jim-mcgovern', 'MA', 'house', 'democrat', 'U.S. Representative', 1997, 'U.S. Representative for Massachusetts'' 2nd district. Ranking member of the House Rules Committee.', 'https://mcgovern.house.gov', null, 'https://en.wikipedia.org/wiki/Jim_McGovern_(American_politician)', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Bennie Thompson', 'bennie-thompson', 'MS', 'house', 'democrat', 'U.S. Representative', 1993, 'U.S. Representative for Mississippi''s 2nd district. Ranking member of the Homeland Security Committee.', 'https://benniethompson.house.gov', null, 'https://en.wikipedia.org/wiki/Bennie_Thompson', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Rosa DeLauro', 'rosa-delauro', 'CT', 'house', 'democrat', 'U.S. Representative', 1991, 'U.S. Representative for Connecticut''s 3rd district. Ranking member of the House Appropriations Committee.', 'https://delauro.house.gov', null, 'https://en.wikipedia.org/wiki/Rosa_DeLauro', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Gerry Connolly', 'gerry-connolly', 'VA', 'house', 'democrat', 'U.S. Representative', 2009, 'U.S. Representative for Virginia''s 11th district. Ranking member of the Oversight Committee.', 'https://connolly.house.gov', null, 'https://en.wikipedia.org/wiki/Gerry_Connolly', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Lloyd Doggett', 'lloyd-doggett', 'TX', 'house', 'democrat', 'U.S. Representative', 1995, 'U.S. Representative for Texas'' 37th district. Senior member of the Ways and Means Committee.', 'https://doggett.house.gov', null, 'https://en.wikipedia.org/wiki/Lloyd_Doggett', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Raja Krishnamoorthi', 'raja-krishnamoorthi', 'IL', 'house', 'democrat', 'U.S. Representative', 2017, 'U.S. Representative for Illinois'' 8th district. Ranking member of the Select Committee on China.', 'https://krishnamoorthi.house.gov', null, 'https://en.wikipedia.org/wiki/Raja_Krishnamoorthi', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Seth Moulton', 'seth-moulton', 'MA', 'house', 'democrat', 'U.S. Representative', 2015, 'U.S. Representative for Massachusetts'' 6th district. Marine veteran with four tours in Iraq.', 'https://moulton.house.gov', null, 'https://en.wikipedia.org/wiki/Seth_Moulton', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Val Demings', 'val-demings', 'FL', 'house', 'democrat', 'Former U.S. Representative', 2017, 'Former U.S. Representative for Florida''s 10th district. Former Orlando police chief and impeachment manager.', 'https://demings.house.gov', null, 'https://en.wikipedia.org/wiki/Val_Demings', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Colin Allred', 'colin-allred', 'TX', 'house', 'democrat', 'U.S. Representative', 2019, 'U.S. Representative for Texas'' 32nd district. Former NFL linebacker and civil rights attorney.', 'https://allred.house.gov', null, 'https://en.wikipedia.org/wiki/Colin_Allred', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Sara Jacobs', 'sara-jacobs', 'CA', 'house', 'democrat', 'U.S. Representative', 2021, 'U.S. Representative for California''s 51st district. Former State Department policy advisor.', 'https://sarajacobs.house.gov', null, 'https://en.wikipedia.org/wiki/Sara_Jacobs', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Summer Lee', 'summer-lee', 'PA', 'house', 'democrat', 'U.S. Representative', 2023, 'U.S. Representative for Pennsylvania''s 12th district. First Black woman to represent Pennsylvania in Congress.', 'https://summerlee.house.gov', null, 'https://en.wikipedia.org/wiki/Summer_Lee', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;

insert into politicians (name, slug, state, chamber, party, title, since_year, bio, website_url, donate_url, wiki_url, image_url) values
('Mary Gay Scanlon', 'mary-gay-scanlon', 'PA', 'house', 'democrat', 'U.S. Representative', 2018, 'U.S. Representative for Pennsylvania''s 5th district. Vice Chair of the House Judiciary Committee.', 'https://scanlon.house.gov', null, 'https://en.wikipedia.org/wiki/Mary_Gay_Scanlon', null)
on conflict (slug) do update set name=excluded.name, state=excluded.state, chamber=excluded.chamber, party=excluded.party, title=excluded.title, since_year=excluded.since_year, bio=excluded.bio, website_url=excluded.website_url, donate_url=excluded.donate_url, wiki_url=excluded.wiki_url, image_url=excluded.image_url;
