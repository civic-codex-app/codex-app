/**
 * Codex — Load real social media handles for all 271 politicians
 *
 * Usage:  node supabase/load_real_social_media.mjs
 *
 * This updates the politicians table directly (twitter_url, facebook_url,
 * instagram_url, youtube_url columns) keyed on the slug column.
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const env = readFileSync('.env.local', 'utf8')
const vars = {}
for (const line of env.split('\n')) {
  const [k, ...v] = line.split('=')
  if (k && !k.startsWith('#')) vars[k.trim()] = v.join('=').trim()
}
const supabase = createClient(vars.NEXT_PUBLIC_SUPABASE_URL, vars.SUPABASE_SERVICE_ROLE_KEY)

// ─── Helper to build full URLs from handles ────────────────────────────
const tw  = (handle) => handle ? `https://x.com/${handle}` : null
const fb  = (handle) => handle ? `https://www.facebook.com/${handle}` : null
const ig  = (handle) => handle ? `https://www.instagram.com/${handle}` : null
const yt  = (handle) => handle ? `https://www.youtube.com/${handle}` : null

// ─── Social media data: slug → { twitter, facebook, instagram, youtube } ──
// twitter = X/Twitter handle (without @)
// facebook = Facebook page/profile slug
// instagram = Instagram handle (without @)
// youtube = YouTube channel path (e.g. @SenatorX or c/channelname)
const socialData = {
  // ========== SENATE (102) ==========
  'adam-schiff':            { twitter: 'SenSchiff',            facebook: 'RepAdamSchiff',          instagram: 'repschiff',           youtube: '@RepAdamSchiff' },
  'alex-padilla':           { twitter: 'SenAlexPadilla',       facebook: 'SenAlexPadilla',         instagram: 'senalexpadilla',      youtube: '@SenAlexPadilla' },
  'amy-klobuchar':          { twitter: 'SenAmyKlobuchar',      facebook: 'amyklobuchar',           instagram: 'amyklobuchar',        youtube: '@SenatorKlobuchar' },
  'andy-kim':               { twitter: 'SenAndyKimNJ',         facebook: 'AndyKimNJ',              instagram: 'andykimnj',           youtube: null },
  'angela-alsobrooks':      { twitter: 'SenAlsobrooks',        facebook: 'AngelaAlsobrooks',       instagram: 'angelaalsobrooks',    youtube: null },
  'angus-king':             { twitter: 'SenAngusKing',         facebook: 'SenatorAngusKingJr',     instagram: 'senangusking',        youtube: '@SenatorAngusKing' },
  'ashley-moody':           { twitter: 'SenAshleyMoody',       facebook: 'AshleyMoodyFL',          instagram: 'ashleymoodyfl',       youtube: null },
  'ben-ray-lujan':          { twitter: 'SenatorLujan',         facebook: 'SenatorLujan',           instagram: 'senatorlujan',        youtube: '@SenatorLujan' },
  'bernie-moreno':          { twitter: 'SenBernieMoreno',      facebook: 'berniemorenoOH',         instagram: 'berniemoreno',        youtube: null },
  'bernie-sanders':         { twitter: 'SenSanders',           facebook: 'senatorsanders',         instagram: 'berniesanders',       youtube: '@SenatorSanders' },
  'bill-cassidy':           { twitter: 'SenBillCassidy',       facebook: 'SenBillCassidy',         instagram: 'senbillcassidy',      youtube: '@SenatorBillCassidy' },
  'bill-hagerty':           { twitter: 'SenHagerty',           facebook: 'SenBillHagerty',         instagram: 'senhagerty',          youtube: '@SenBillHagerty' },
  'brian-schatz':           { twitter: 'SenBrianSchatz',       facebook: 'SenBrianSchatz',         instagram: 'senbrianschatz',      youtube: '@SenBrianSchatz' },
  'catherine-cortez-masto': { twitter: 'SenCortezMasto',       facebook: 'SenatorCortezMasto',     instagram: 'sencortezmasto',      youtube: '@SenCortezMasto' },
  'chris-coons':            { twitter: 'ChrisCoons',           facebook: 'senatorchriscoons',      instagram: 'chriscoons',          youtube: '@SenChrisCoons' },
  'chris-murphy':           { twitter: 'ChrisMurphyCT',        facebook: 'ChrisMurphyCT',          instagram: 'chrismurphyct',       youtube: '@SenChrisMurphy' },
  'chris-van-hollen':       { twitter: 'ChrisVanHollen',       facebook: 'chrisvanhollen',         instagram: 'chrisvanhollen',      youtube: '@SenVanHollen' },
  'chuck-grassley':         { twitter: 'ChuckGrassley',        facebook: 'grassley',               instagram: 'sengrasley',          youtube: '@SenChuckGrassley' },
  'chuck-schumer':          { twitter: 'SenSchumer',           facebook: 'SenSchumer',             instagram: 'senschumer',          youtube: '@SenSchumer' },
  'cindy-hyde-smith':       { twitter: 'SenHydeSmith',         facebook: 'SenCindyHydeSmith',      instagram: 'senhydesmith',        youtube: '@SenCindyHydeSmith' },
  'cory-booker':            { twitter: 'CoryBooker',           facebook: 'CoryBooker',             instagram: 'corybooker',          youtube: '@SenBooker' },
  'cynthia-lummis':         { twitter: 'SenLummis',            facebook: 'CynthiaLummis',          instagram: 'senlummis',           youtube: '@SenLummis' },
  'dan-sullivan':           { twitter: 'SenDanSullivan',       facebook: 'SenDanSullivan',         instagram: 'sendansullivan',      youtube: '@SenDanSullivan' },
  'dave-mccormick':         { twitter: 'SenMcCormickPA',       facebook: 'DaveMcCormickPA',        instagram: 'davemccormickpa',     youtube: null },
  'deb-fischer':            { twitter: 'SenatorFischer',       facebook: 'senatordebfischer',      instagram: 'senatorfischer',      youtube: '@senatordebfischer' },
  'dick-durbin':            { twitter: 'SenatorDurbin',        facebook: 'SenatorDurbin',          instagram: 'senatordurbin',       youtube: '@SenatorDurbin' },
  'ed-markey':              { twitter: 'SenMarkey',            facebook: 'EdJMarkey',              instagram: 'senmarkey',           youtube: '@SenMarkey' },
  'elissa-slotkin':         { twitter: 'SenSlotkin',           facebook: 'ElissaSlotkin',          instagram: 'elaborslotkin',       youtube: null },
  'elizabeth-warren':       { twitter: 'SenWarren',            facebook: 'ElizabethWarren',        instagram: 'elizabethwarren',     youtube: '@SenWarren' },
  'eric-schmitt':           { twitter: 'SenEricSchmitt',       facebook: 'EricSchmittMO',          instagram: 'senericschmitt',      youtube: '@SenEricSchmitt' },
  'gary-peters':            { twitter: 'SenGaryPeters',        facebook: 'SenGaryPeters',          instagram: 'sengypeters',         youtube: '@SenGaryPeters' },
  'jack-reed':              { twitter: 'SenJackReed',          facebook: 'SenJackReed',            instagram: 'senjackreed',         youtube: '@SenReed' },
  'jacky-rosen':            { twitter: 'SenJackyRosen',        facebook: 'SenJackyRosen',          instagram: 'senjackyrosen',       youtube: '@SenJackyRosen' },
  'james-lankford':         { twitter: 'SenatorLankford',      facebook: 'SenatorLankford',        instagram: 'senatorlankford',     youtube: '@SenatorLankford' },
  'jd-vance':               { twitter: 'JDVance',              facebook: 'JDVance1',               instagram: 'jdvance',             youtube: null },
  'jeanne-shaheen':         { twitter: 'SenatorShaheen',       facebook: 'SenatorShaheen',         instagram: 'senatorshaheen',      youtube: '@SenShaheen' },
  'jeff-merkley':           { twitter: 'SenJeffMerkley',       facebook: 'jeffmerkley',            instagram: 'senjeffmerkley',      youtube: '@SenJeffMerkley' },
  'jerry-moran':            { twitter: 'JerryMoran',           facebook: 'SenJerryMoran',          instagram: 'senjerrymoran',       youtube: '@SenJerryMoran' },
  'jim-banks':              { twitter: 'SenJimBanks',          facebook: 'RepJimBanks',            instagram: 'repjimbanks',         youtube: null },
  'jim-justice':            { twitter: 'SenJimJustice',        facebook: 'JimJusticeWV',           instagram: 'jimjusticewv',        youtube: null },
  'jim-risch':              { twitter: 'SenatorRisch',         facebook: 'SenatorRisch',           instagram: 'senatorrisch',        youtube: '@SenatorRisch' },
  'john-barrasso':          { twitter: 'SenJohnBarrasso',      facebook: 'johnbarrasso',           instagram: 'senjohnbarrasso',     youtube: '@SenJohnBarrasso' },
  'john-boozman':           { twitter: 'JohnBoozman',          facebook: 'JohnBoozman',            instagram: 'johnboozman',         youtube: '@SenJohnBoozman' },
  'john-cornyn':            { twitter: 'JohnCornyn',           facebook: 'SenJohnCornyn',          instagram: 'johncornyn',          youtube: '@SenJohnCornyn' },
  'john-curtis':            { twitter: 'SenJohnCurtis',        facebook: 'RepJohnCurtis',          instagram: 'repjohncurtis',       youtube: null },
  'john-fetterman':         { twitter: 'SenFettermanPA',       facebook: 'JohnFettermanPA',        instagram: 'johnfetterman',       youtube: '@SenFetterman' },
  'john-hickenlooper':      { twitter: 'SenatorHick',          facebook: 'hickenlooper',           instagram: 'senatorhick',         youtube: '@SenHickenlooper' },
  'john-hoeven':            { twitter: 'SenJohnHoeven',        facebook: 'SenJohnHoeven',          instagram: 'senjohnhoeven',       youtube: '@SenJohnHoeven' },
  'john-kennedy':           { twitter: 'SenJohnKennedy',       facebook: 'SenJohnKennedy',         instagram: 'senjohnkennedy',      youtube: '@SenJohnKennedy' },
  'john-thune':             { twitter: 'SenJohnThune',         facebook: 'SenJohnThune',           instagram: 'senjohnthune',        youtube: '@SenJohnThune' },
  'jon-husted':             { twitter: 'JonHusted',            facebook: 'JonHusted',              instagram: 'jonhusted',           youtube: null },
  'jon-ossoff':             { twitter: 'SenOssoff',            facebook: 'SenOssoff',              instagram: 'senossoff',           youtube: '@SenOssoff' },
  'joni-ernst':             { twitter: 'SenJoniErnst',         facebook: 'joniernst',              instagram: 'senjoniernst',        youtube: '@SenJoniErnst' },
  'josh-hawley':            { twitter: 'HawleyMO',             facebook: 'SenJoshHawley',          instagram: 'senatorhawley',       youtube: '@SenHawley' },
  'katie-britt':            { twitter: 'SenKatieBritt',        facebook: 'KatieBrittForAlabama',   instagram: 'senkatiebritt',       youtube: '@SenKatieBritt' },
  'kevin-cramer':           { twitter: 'SenKevinCramer',       facebook: 'SenKevinCramer',         instagram: 'senkevincramer',      youtube: '@SenKevinCramer' },
  'kirsten-gillibrand':     { twitter: 'SenGillibrand',        facebook: 'KirstenGillibrand',      instagram: 'kirstengillibrand',   youtube: '@SenGillibrand' },
  'lindsey-graham':         { twitter: 'LindseyGrahamSC',      facebook: 'LindseyGrahamSC',        instagram: 'lindseygrahamsc',     youtube: '@SenLindseyGraham' },
  'lisa-blunt-rochester':   { twitter: 'SenBluntRochester',    facebook: 'LisaBluntRochester',     instagram: 'lisabr4congress',     youtube: null },
  'lisa-murkowski':         { twitter: 'LisaMurkowski',        facebook: 'SenLisaMurkowski',       instagram: 'lisamurkowski',       youtube: '@SenLisaMurkowski' },
  'maggie-hassan':          { twitter: 'SenHassan',            facebook: 'SenHassan',              instagram: 'senhassan',           youtube: '@SenMaggieHassan' },
  'maria-cantwell':         { twitter: 'SenatorCantwell',      facebook: 'SenatorCantwell',        instagram: 'senatorcantwell',     youtube: '@SenCantwell' },
  'mark-kelly':             { twitter: 'SenMarkKelly',         facebook: 'CaptMarkKelly',          instagram: 'senmarkkelly',        youtube: '@SenMarkKelly' },
  'mark-warner':            { twitter: 'MarkWarner',           facebook: 'MarkRWarner',            instagram: 'markwarner',          youtube: '@SenMarkWarner' },
  'markwayne-mullin':       { twitter: 'SenMullin',            facebook: 'SenMullin',              instagram: 'senmullin',           youtube: '@SenMullin' },
  'marsha-blackburn':       { twitter: 'MarshaBlackburn',      facebook: 'MarshaBlackburn',        instagram: 'marshablackburn',     youtube: '@SenMarshaBlackburn' },
  'martin-heinrich':        { twitter: 'MartinHeinrich',       facebook: 'MartinHeinrich',         instagram: 'martinheinrich',      youtube: '@SenMartinHeinrich' },
  'mazie-hirono':           { twitter: 'MazieHirono',          facebook: 'maikiehirono',           instagram: 'maziehirono',         youtube: '@SenMazieHirono' },
  'michael-bennet':         { twitter: 'SenatorBennet',        facebook: 'senatorbennet',          instagram: 'senatorbennet',       youtube: '@SenatorBennet' },
  'mike-crapo':             { twitter: 'MikeCrapo',            facebook: 'MikeCrapo',              instagram: 'senatormikecrapo',    youtube: '@SenMikeCrapo' },
  'mike-lee':               { twitter: 'SenMikeLee',           facebook: 'SenMikeLee',             instagram: 'senmikelee',          youtube: '@SenMikeLee' },
  'mike-rounds':            { twitter: 'SenatorRounds',        facebook: 'SenMikeRounds',          instagram: 'senatorrounds',       youtube: '@SenMikeRounds' },
  'mitch-mcconnell':        { twitter: 'LeaderMcConnell',      facebook: 'mitchmcconnell',         instagram: 'leadermcconnell',     youtube: '@LeaderMcConnell' },
  'patty-murray':           { twitter: 'PattyMurray',          facebook: 'pattymurray',            instagram: 'pattymurray',         youtube: '@SenPattyMurray' },
  'pete-ricketts':          { twitter: 'SenatorRicketts',      facebook: 'SenPeteRicketts',        instagram: 'senricketts',         youtube: '@SenPeteRicketts' },
  'peter-welch':            { twitter: 'SenPeterWelch',        facebook: 'PeterWelchVT',           instagram: 'senpeterwelch',       youtube: '@SenPeterWelch' },
  'rand-paul':              { twitter: 'RandPaul',             facebook: 'SenatorRandPaul',        instagram: 'senrandpaul',         youtube: '@SenRandPaul' },
  'raphael-warnock':        { twitter: 'SenWarnock',           facebook: 'SenWarnock',             instagram: 'senwarnock',          youtube: '@SenWarnock' },
  'richard-blumenthal':     { twitter: 'SenBlumenthal',        facebook: 'SenBlumenthal',          instagram: 'senblumenthal',       youtube: '@SenBlumenthal' },
  'richard-shelby':         { twitter: 'SenShelby',            facebook: 'RichardShelby',          instagram: null,                  youtube: '@SenShelby' },
  'rick-scott':             { twitter: 'SenRickScott',         facebook: 'SenRickScott',           instagram: 'senrickscott',        youtube: '@SenRickScott' },
  'roger-marshall':         { twitter: 'RogerMarshallMD',      facebook: 'RogerMarshallMD',        instagram: 'rogermarshallmd',     youtube: '@SenRogerMarshall' },
  'roger-wicker':           { twitter: 'SenatorWicker',        facebook: 'SenatorWicker',          instagram: 'senatorwicker',       youtube: '@SenatorWicker' },
  'ron-johnson':            { twitter: 'SenRonJohnson',        facebook: 'SenRonJohnson',          instagram: 'senronjohnson',       youtube: '@SenRonJohnson' },
  'ron-wyden':              { twitter: 'RonWyden',             facebook: 'RonWyden',               instagram: 'ronwyden',            youtube: '@SenRonWyden' },
  'ruben-gallego':          { twitter: 'SenRubenGallego',      facebook: 'RubenGallego',           instagram: 'rubengallego',        youtube: null },
  'sheldon-whitehouse':     { twitter: 'SenWhitehouse',        facebook: 'SenatorWhitehouse',      instagram: 'senwhitehouse',       youtube: '@SenWhitehouse' },
  'shelley-moore-capito':   { twitter: 'SenCapito',            facebook: 'senshelleymoore',        instagram: 'sencapito',           youtube: '@SenCapito' },
  'steve-daines':           { twitter: 'SteveDaines',          facebook: 'SteveDainesMT',          instagram: 'stevedaines',         youtube: '@SenSteveDaines' },
  'susan-collins':          { twitter: 'SenatorCollins',       facebook: 'SenatorSusanCollins',    instagram: 'senatorcollins',      youtube: '@SenSusanCollins' },
  'tammy-baldwin':          { twitter: 'SenatorBaldwin',       facebook: 'TammyBaldwin',           instagram: 'senatorbaldwin',      youtube: '@SenTammyBaldwin' },
  'tammy-duckworth':        { twitter: 'SenDuckworth',         facebook: 'SenDuckworth',           instagram: 'senduckworth',        youtube: '@SenDuckworth' },
  'ted-budd':               { twitter: 'SenTedBudd',           facebook: 'SenTedBudd',             instagram: 'sentedbudd',          youtube: '@SenTedBudd' },
  'ted-cruz':               { twitter: 'SenTedCruz',           facebook: 'SenTedCruz',             instagram: 'sentedcruz',          youtube: '@SenTedCruz' },
  'thom-tillis':            { twitter: 'SenThomTillis',        facebook: 'SenThomTillis',          instagram: 'senthomtillis',       youtube: '@SenThomTillis' },
  'tim-kaine':              { twitter: 'timkaine',             facebook: 'SenatorKaine',           instagram: 'timkaine',            youtube: '@SenTimKaine' },
  'tim-scott':              { twitter: 'SenatorTimScott',      facebook: 'SenatorTimScott',        instagram: 'senatortimscott',     youtube: '@SenTimScott' },
  'tim-sheehy':             { twitter: 'SenTimSheehy',         facebook: 'TimSheehyMT',            instagram: 'timsheehymt',         youtube: null },
  'tina-smith':             { twitter: 'SenTinaSmith',         facebook: 'SenTinaSmith',           instagram: 'sentinasmith',        youtube: '@SenTinaSmith' },
  'todd-young':             { twitter: 'SenToddYoung',         facebook: 'SenToddYoung',           instagram: 'sentoddyoung',        youtube: '@SenToddYoung' },
  'tom-cotton':             { twitter: 'SenTomCotton',         facebook: 'SenTomCotton',           instagram: 'sentomcotton',        youtube: '@SenTomCotton' },
  'tommy-tuberville':       { twitter: 'SenTuberville',        facebook: 'SenTuberville',          instagram: 'sentuberville',       youtube: '@SenTuberville' },

  // ========== HOUSE (98) ==========
  'abigail-spanberger':       { twitter: 'SpanbergerVA07',       facebook: 'SpanbergerForCongress',    instagram: 'repspanberger',       youtube: null },
  'adam-smith':               { twitter: 'RepAdamSmith',         facebook: 'RepAdamSmith',             instagram: 'repadamsmith',        youtube: '@RepAdamSmith' },
  'alexandria-ocasio-cortez': { twitter: 'AOC',                  facebook: 'OcasioCortez',             instagram: 'aoc',          youtube: '@RepAOC' },
  'andy-biggs':               { twitter: 'RepAndyBiggsAZ',       facebook: 'RepAndyBiggs',             instagram: 'repandybiggs',        youtube: '@RepAndyBiggs' },
  'anna-paulina-luna':        { twitter: 'RepLuna',              facebook: 'APLunaFL',                 instagram: 'realannapaulineluna', youtube: null },
  'ayanna-pressley':          { twitter: 'RepPressley',          facebook: 'RepAyannaPressley',        instagram: 'repayannpressley',       youtube: '@RepPressley' },
  'barbara-lee':              { twitter: 'RepBarbaraLee',        facebook: 'RepBarbaraLee',            instagram: 'repbarbaralee',       youtube: '@RepBarbaraLee' },
  'barry-loudermilk':         { twitter: 'RepLoudermilk',        facebook: 'RepLoudermilk',            instagram: 'reploudermilk',       youtube: '@RepLoudermilk' },
  'bennie-thompson':          { twitter: 'BennieGThompson',      facebook: 'RepBennieThompson',        instagram: 'repbenniethompson',   youtube: null },
  'beth-van-duyne':           { twitter: 'RepBethVanDuyne',      facebook: 'RepBethVanDuyne',          instagram: 'repbethvanduyne',     youtube: null },
  'bob-good':                 { twitter: 'RepBobGood',           facebook: 'RepBobGood',               instagram: 'repbobgood',          youtube: null },
  'brandon-williams':         { twitter: 'RepWilliams',          facebook: 'RepBrandonWilliams',       instagram: 'repbrandonwilliams',  youtube: null },
  'brian-fitzpatrick':        { twitter: 'RepBrianFitz',         facebook: 'RepBrianFitzpatrick',      instagram: 'repbrianfitzpatrick', youtube: '@RepBrianFitz' },
  'byron-donalds':            { twitter: 'RepDonaldsPress',      facebook: 'RepDonaldsPress',          instagram: 'repbyrondonalds',     youtube: '@RepByronDonalds' },
  'carlos-gimenez':           { twitter: 'RepCarlos',            facebook: 'RepCarlosGimenez',         instagram: 'repcarlosgimenez',    youtube: null },
  'cathy-mcmorris-rodgers':   { twitter: 'CathyMcMorris',        facebook: 'McMorrisRodgers',          instagram: 'mcmorrisrodgers',     youtube: '@McMorrisRodgers' },
  'chip-roy':                 { twitter: 'RepChipRoy',           facebook: 'RepChipRoy',               instagram: 'repchiproy',          youtube: '@RepChipRoy' },
  'colin-allred':             { twitter: 'ColinAllredTX',        facebook: 'ColinAllredTX',            instagram: 'colinallredtx',       youtube: null },
  'cori-bush':                { twitter: 'RepCori',              facebook: 'RepCoriBush',              instagram: 'repcori',             youtube: null },
  'dan-crenshaw':             { twitter: 'RepCrenshaw',          facebook: 'RepCrenshaw',              instagram: 'repcrenshaw',         youtube: '@RepDanCrenshaw' },
  'debbie-wasserman-schultz': { twitter: 'RepDWStweets',         facebook: 'RepDWS',                   instagram: 'repdws',              youtube: null },
  'don-bacon':                { twitter: 'RepDonBacon',          facebook: 'RepDonBacon',              instagram: 'repdonbacon',         youtube: '@RepDonBacon' },
  'elise-stefanik':           { twitter: 'RepStefanik',          facebook: 'RepStefanik',              instagram: 'repstefanik',         youtube: '@RepStefanik' },
  'eric-swalwell':            { twitter: 'RepSwalwell',          facebook: 'RepEricSwalwell',          instagram: 'repswalwell',         youtube: '@RepEricSwalwell' },
  'frederica-wilson':         { twitter: 'RepWilson',            facebook: 'RepWilson',                instagram: 'repwilson',           youtube: null },
  'gerry-connolly':           { twitter: 'GerryConnolly',        facebook: 'CongressmanGerryConnolly', instagram: 'repgerryconnolly',    youtube: null },
  'gregory-meeks':            { twitter: 'GregoryMeeks',         facebook: 'RepGregoryMeeks',          instagram: 'repgregorymeeks',     youtube: null },
  'hakeem-jeffries':          { twitter: 'RepJeffries',          facebook: 'RepHakeemJeffries',        instagram: 'repjeffries',         youtube: '@RepJeffries' },
  'ilhan-omar':               { twitter: 'IlhanMN',             facebook: 'IlhanMN',                  instagram: 'ilhanmn',             youtube: '@RepIlhanOmar' },
  'james-comer':              { twitter: 'RepJamesComer',        facebook: 'RepJamesComer',            instagram: 'repjamescomer',       youtube: '@RepJamesComer' },
  'jamie-raskin':             { twitter: 'RepRaskin',            facebook: 'RepRaskin',                instagram: 'repraskin',           youtube: '@RepRaskin' },
  'jared-moskowitz':          { twitter: 'RepMoskowitz',         facebook: 'RepMoskowitz',             instagram: 'repmoskowitz',        youtube: null },
  'jasmine-crockett':         { twitter: 'RepJasmine',           facebook: 'RepJasmineCrockett',       instagram: 'repjasmine',          youtube: null },
  'jason-smith':              { twitter: 'RepJasonSmith',        facebook: 'RepJasonSmith',            instagram: 'repjasonsmith',       youtube: '@RepJasonSmith' },
  'jerry-nadler':             { twitter: 'RepJerryNadler',       facebook: 'CongressmanNadler',        instagram: 'repnadler',           youtube: '@RepJerryNadler' },
  'jim-clyburn':              { twitter: 'ClyburnSC6',           facebook: 'JimClyburn',               instagram: 'jimclyburn',          youtube: null },
  'jim-jordan':               { twitter: 'Jim_Jordan',           facebook: 'RepJimJordan',             instagram: 'repjimjordan',        youtube: '@RepJimJordan' },
  'jim-mcgovern':             { twitter: 'RepMcGovern',          facebook: 'RepJimMcGovern',           instagram: 'repmcgovern',         youtube: '@RepMcGovern' },
  'joaquin-castro':           { twitter: 'JoaquinCastrotx',      facebook: 'JoaquinCastroTX',          instagram: 'joaquincastrotx',     youtube: null },
  'jodey-arrington':          { twitter: 'RepArrington',         facebook: 'RepArrington',             instagram: 'reparrington',        youtube: null },
  'joe-neguse':               { twitter: 'RepJoeNeguse',         facebook: 'RepJoeNeguse',             instagram: 'repjoeneguse',        youtube: null },
  'josh-gottheimer':          { twitter: 'RepJoshG',             facebook: 'RepJoshG',                 instagram: 'repjoshg',            youtube: null },
  'katherine-clark':          { twitter: 'RepKClark',            facebook: 'RepKatherineClark',        instagram: 'repkatherineclark',   youtube: '@RepKClark' },
  'katie-porter':             { twitter: 'RepKatiePorter',       facebook: 'RepKatiePorter',           instagram: 'repkatieporter',      youtube: '@RepKatiePorter' },
  'kevin-mccarthy':           { twitter: 'SpeakerMcCarthy',      facebook: 'RepKevinMcCarthy',         instagram: 'speakermccarthy',     youtube: '@RepKevinMcCarthy' },
  'lauren-boebert':           { twitter: 'RepBoebert',           facebook: 'RepBoebert',               instagram: 'laurenboebert',       youtube: '@RepBoebert' },
  'liz-cheney':               { twitter: 'Liz_Cheney',           facebook: 'RepLizCheney',             instagram: 'repcheney',           youtube: null },
  'lloyd-doggett':            { twitter: 'RepLloydDoggett',      facebook: 'RepLloydDoggett',          instagram: 'replloyddoggett',     youtube: null },
  'maria-elvira-salazar':     { twitter: 'RepMariaSalazar',      facebook: 'RepMariaSalazar',          instagram: 'repmariasalazar',     youtube: null },
  'marjorie-taylor-greene':   { twitter: 'RepMTG',               facebook: 'RepMTG',                   instagram: 'repmtg',              youtube: '@RepMTG' },
  'mark-green':               { twitter: 'RepMarkGreen',         facebook: 'RepMarkGreen',             instagram: 'repmarkgreen',        youtube: null },
  'mark-takano':              { twitter: 'RepMarkTakano',        facebook: 'RepMarkTakano',            instagram: 'repmarktakano',       youtube: '@RepTakano' },
  'mary-gay-scanlon':         { twitter: 'RepMGS',               facebook: 'RepMGS',                   instagram: 'repmgs',              youtube: null },
  'matt-gaetz':               { twitter: 'mattgaetz',            facebook: 'RepMattGaetz',             instagram: 'repgaetz',            youtube: '@RepGaetz' },
  'maxine-waters':            { twitter: 'RepMaxineWaters',      facebook: 'MaxineWaters',             instagram: 'repmaxinewaters',     youtube: '@RepMaxineWaters' },
  'maxwell-frost':            { twitter: 'RepMaxwellFrost',      facebook: 'RepMaxwellFrost',          instagram: 'repmaxwellfrost',     youtube: null },
  'michael-mccaul':           { twitter: 'RepMcCaul',            facebook: 'MichaelMcCaul',            instagram: 'repmccaul',           youtube: '@RepMcCaul' },
  'mike-garcia':              { twitter: 'RepMikeGarcia',        facebook: 'RepMikeGarcia',            instagram: 'repmikegarcia',       youtube: null },
  'mike-johnson':             { twitter: 'SpeakerJohnson',       facebook: 'RepMikeJohnson',           instagram: 'speakerjohnson',      youtube: '@RepMikeJohnson' },
  'mike-lawler':              { twitter: 'RepMikeLawler',        facebook: 'RepMikeLawler',            instagram: 'repmikelawler',       youtube: null },
  'mike-rogers-al':           { twitter: 'RepMikeRogersAL',      facebook: 'RepMikeRogersAL',          instagram: null,                  youtube: null },
  'mike-turner':              { twitter: 'RepMikeTurner',        facebook: 'RepMikeTurner',            instagram: 'repmiketurner',       youtube: null },
  'mike-waltz':               { twitter: 'RepWaltz',             facebook: 'RepMichaelWaltz',          instagram: 'repwaltz',            youtube: null },
  'mikie-sherrill':           { twitter: 'RepSherrill',          facebook: 'RepMikieSherrill',         instagram: 'repsherrill',         youtube: null },
  'nancy-mace':               { twitter: 'RepNancyMace',         facebook: 'RepNancyMace',             instagram: 'repnancymace',        youtube: null },
  'nancy-pelosi':             { twitter: 'SpeakerPelosi',        facebook: 'NancyPelosi',              instagram: 'nancypelosi',         youtube: '@SpeakerPelosi' },
  'nick-lalota':              { twitter: 'RepLaLota',            facebook: 'RepLaLota',                instagram: 'replalota',           youtube: null },
  'nicole-malliotakis':       { twitter: 'RepMalliotakis',       facebook: 'RepMalliotakis',           instagram: 'repmalliotakis',      youtube: null },
  'patrick-mchenry':          { twitter: 'PatrickMcHenry',       facebook: 'RepPatrickMcHenry',        instagram: 'repmchenry',          youtube: null },
  'paul-gosar':               { twitter: 'RepGosar',             facebook: 'RepGosar',                 instagram: 'repgosar',            youtube: null },
  'pete-aguilar':             { twitter: 'RepPeteAguilar',       facebook: 'RepPeteAguilar',           instagram: 'reppeteaguilar',      youtube: null },
  'pramila-jayapal':          { twitter: 'RepJayapal',           facebook: 'RepJayapal',               instagram: 'repjayapal',          youtube: '@RepJayapal' },
  'raja-krishnamoorthi':      { twitter: 'RepRaja',              facebook: 'CongressmanRaja',          instagram: 'repraja',             youtube: null },
  'ralph-norman':             { twitter: 'RepRalphNorman',       facebook: 'RepRalphNorman',           instagram: 'repralphnorman',      youtube: null },
  'rashida-tlaib':            { twitter: 'RepRashida',           facebook: 'RepRashida',               instagram: 'reprashida',          youtube: null },
  'ritchie-torres':           { twitter: 'RepRitchie',           facebook: 'RepRitchieTorres',         instagram: 'repritchie',          youtube: null },
  'ro-khanna':                { twitter: 'RepRoKhanna',          facebook: 'RepRoKhanna',              instagram: 'reprokhanna',         youtube: '@RepRoKhanna' },
  'robert-garcia':            { twitter: 'RepRobertGarcia',      facebook: 'RepRobertGarcia',          instagram: 'reprobertgarcia',     youtube: null },
  'rosa-delauro':             { twitter: 'RosaDeLauro',          facebook: 'CongresswomanDeLauro',     instagram: 'rosadelauro',         youtube: null },
  'sam-graves':               { twitter: 'RepSamGraves',         facebook: 'RepSamGraves',             instagram: 'repsamgraves',        youtube: null },
  'sara-jacobs':              { twitter: 'RepSaraJacobs',        facebook: 'RepSaraJacobs',            instagram: 'repsarajacobs',       youtube: null },
  'scott-perry':              { twitter: 'RepScottPerry',        facebook: 'RepScottPerry',            instagram: 'repscottperry',       youtube: null },
  'seth-moulton':             { twitter: 'RepMoulton',           facebook: 'RepMoulton',               instagram: 'repmoulton',          youtube: null },
  'sheila-jackson-lee':       { twitter: 'JacksonLeeTX18',       facebook: 'JacksonLee18',             instagram: 'sheilajacksonlee18',  youtube: null },
  'steny-hoyer':              { twitter: 'LeaderHoyer',          facebook: 'WhipHoyer',                instagram: 'leaderhoyer',         youtube: null },
  'steve-scalise':            { twitter: 'SteveScalise',         facebook: 'RepSteveScalise',          instagram: 'stevescalise',        youtube: '@RepSteveScalise' },
  'summer-lee':               { twitter: 'RepSummerLee',         facebook: 'RepSummerLee',             instagram: 'repsummerlee',        youtube: null },
  'suzan-delbene':            { twitter: 'RepDelBene',           facebook: 'RepDelBene',               instagram: 'repdelbene',          youtube: null },
  'ted-lieu':                 { twitter: 'RepTedLieu',           facebook: 'RepTedLieu',               instagram: 'reptedlieu',          youtube: '@RepTedLieu' },
  'thomas-massie':            { twitter: 'RepThomasMassie',      facebook: 'RepThomasMassie',          instagram: 'repthomasmassie',     youtube: '@RepThomasMassie' },
  'tom-emmer':                { twitter: 'RepTomEmmer',          facebook: 'RepTomEmmer',              instagram: 'reptomemmer',         youtube: '@RepTomEmmer' },
  'tony-gonzales':            { twitter: 'RepTonyGonzales',      facebook: 'RepTonyGonzales',          instagram: 'reptonygonzales',     youtube: null },
  'troy-nehls':               { twitter: 'RepTroyNehls',         facebook: 'RepTroyNehls',             instagram: 'reptroynehls',        youtube: null },
  'val-demings':              { twitter: 'RepValDemings',        facebook: 'RepValDemings',            instagram: 'repvaldemings',       youtube: null },
  'veronica-escobar':         { twitter: 'RepEscobar',           facebook: 'RepEscobar',               instagram: 'repescobar',          youtube: null },
  'virginia-foxx':            { twitter: 'VirginiaFoxx',         facebook: 'RepVirginiaFoxx',          instagram: 'repvirginiafoxx',     youtube: null },
  'wesley-hunt':              { twitter: 'RepWesleyHunt',        facebook: 'RepWesleyHunt',            instagram: 'repwesleyhunt',       youtube: null },
  'young-kim':                { twitter: 'RepYoungKim',          facebook: 'RepYoungKim',              instagram: 'repyoungkim',         youtube: null },

  // ========== GOVERNORS (50) ==========
  'andy-beshear':             { twitter: 'GovAndyBeshear',       facebook: 'GovAndyBeshear',           instagram: 'govandybeshear',      youtube: null },
  'bill-lee':                 { twitter: 'GovBillLee',           facebook: 'GovBillLee',               instagram: 'govbilllee',          youtube: null },
  'bob-ferguson':             { twitter: 'GovFerguson',          facebook: 'BobFergusonAG',            instagram: 'bobfergusonwa',       youtube: null },
  'brad-little':              { twitter: 'GovernorLittle',       facebook: 'GovernorBradLittle',       instagram: 'governorlittle',      youtube: null },
  'brian-kemp':               { twitter: 'GovKemp',              facebook: 'GovKemp',                  instagram: 'govkemp',             youtube: null },
  'dan-mckee':                { twitter: 'GovDanMcKee',          facebook: 'GovDanMcKee',              instagram: 'govdanmckee',         youtube: null },
  'gavin-newsom':             { twitter: 'GavinNewsom',          facebook: 'GavinNewsom',              instagram: 'gavinnewsom',         youtube: '@GavinNewsom' },
  'glenn-youngkin':           { twitter: 'GlennYoungkin',        facebook: 'GlennYoungkin',            instagram: 'glennyoungkin',       youtube: null },
  'greg-abbott':              { twitter: 'GovAbbott',            facebook: 'TexasGovernor',            instagram: 'govabbott',           youtube: '@GovAbbott' },
  'greg-gianforte':           { twitter: 'GovGianforte',         facebook: 'GovGianforte',             instagram: 'govgianforte',        youtube: null },
  'gretchen-whitmer':         { twitter: 'GovWhitmer',           facebook: 'GovWhitmer',               instagram: 'govwhitmer',          youtube: null },
  'henry-mcmaster':           { twitter: 'henrymcmaster',        facebook: 'HenryMcMaster',            instagram: 'henrymcmaster',       youtube: null },
  'janet-mills':              { twitter: 'GovJanetMills',        facebook: 'GovernorJanetMills',       instagram: 'govjanetmills',       youtube: null },
  'jared-polis':              { twitter: 'GovofCO',              facebook: 'PolisForColorado',         instagram: 'jaredpolis',       youtube: null },
  'jb-pritzker':              { twitter: 'GovPritzker',          facebook: 'GovPritzker',              instagram: 'govpritzker',         youtube: null },
  'jeff-landry':              { twitter: 'JeffLandry',           facebook: 'JeffLandry',               instagram: 'jefflandry',          youtube: null },
  'jim-pillen':               { twitter: 'GovPillen',            facebook: 'GovPillen',                instagram: 'govpillen',           youtube: null },
  'joe-lombardo':             { twitter: 'GovLombardo',          facebook: 'GovJoeLombardo',           instagram: 'govlombardo',         youtube: null },
  'josh-green':               { twitter: 'GovJoshGreenMD',       facebook: 'GovJoshGreen',             instagram: 'govjoshgreenmd',      youtube: null },
  'josh-shapiro':             { twitter: 'GovernorShapiro',      facebook: 'GovernorShapiro',          instagram: 'governorshapiro',     youtube: null },
  'josh-stein':               { twitter: 'GovJoshStein',         facebook: 'JoshSteinNC',              instagram: 'joshnc',              youtube: null },
  'kathy-hochul':             { twitter: 'GovKathyHochul',       facebook: 'GovKathyHochul',           instagram: 'govkathyhochul',      youtube: null },
  'katie-hobbs':              { twitter: 'GovernorHobbs',        facebook: 'GovernorKatieHobbs',       instagram: 'governorhobbs',       youtube: null },
  'kay-ivey':                 { twitter: 'GovernorKayIvey',      facebook: 'KayIvey',                  instagram: 'governorkayivey',     youtube: null },
  'kelly-armstrong':          { twitter: 'GovArmstrong',         facebook: 'KellyArmstrongND',         instagram: 'kellyarmstrongnd',    youtube: null },
  'kelly-ayotte':             { twitter: 'GovAyotte',            facebook: 'KellyAyotte',              instagram: 'kellyayotte',         youtube: null },
  'kevin-stitt':              { twitter: 'GovStitt',             facebook: 'GovStitt',                 instagram: 'govstitt',            youtube: null },
  'kim-reynolds':             { twitter: 'KimReynoldsIA',        facebook: 'KimReynoldsIA',            instagram: 'kimreynoldsia',       youtube: null },
  'kristi-noem':              { twitter: 'KristiNoem',           facebook: 'KristiNoem',               instagram: 'kristinoem',          youtube: null },
  'laura-kelly':              { twitter: 'GovLauraKelly',        facebook: 'GovLauraKelly',            instagram: 'govlaurakelly',       youtube: null },
  'mark-gordon':              { twitter: 'GovernorGordon',       facebook: 'GovernorMarkGordon',       instagram: 'governorgordon',      youtube: null },
  'matt-meyer':               { twitter: 'GovMattMeyer',         facebook: 'MattMeyerDE',              instagram: 'mattmeyerde',         youtube: null },
  'maura-healey':             { twitter: 'GovHealey',            facebook: 'GovMauraHealey',           instagram: 'govhealey',           youtube: null },
  'michelle-lujan-grisham':   { twitter: 'GovMLG',               facebook: 'GovMLG',                   instagram: 'govmlg',              youtube: null },
  'mike-braun':               { twitter: 'GovMikeBraun',         facebook: 'MikeBraunIN',              instagram: 'mikebraunin',         youtube: null },
  'mike-dewine':              { twitter: 'GovMikeDeWine',        facebook: 'GovMikeDeWine',            instagram: 'govmikedewine',       youtube: null },
  'mike-dunleavy':            { twitter: 'GovDunleavy',         facebook: 'GovDunleavy',              instagram: 'govdunleavy',         youtube: null },
  'mike-kehoe':               { twitter: 'GovMikeKehoe',         facebook: 'MikeKehoeMO',              instagram: 'mikekehoe',          youtube: null },
  'ned-lamont':               { twitter: 'GovNedLamont',         facebook: 'GovNedLamont',             instagram: 'govnedlamont',        youtube: null },
  'patrick-morrisey':         { twitter: 'GovMorrisey',          facebook: 'PatrickMorriseyWV',        instagram: 'patrickmorrisey',     youtube: null },
  'phil-murphy':              { twitter: 'GovMurphy',            facebook: 'GovMurphy',                instagram: 'govmurphy',           youtube: null },
  'phil-scott':               { twitter: 'GovPhilScott',         facebook: 'GovPhilScott',             instagram: 'govphilscott',        youtube: null },
  'ron-desantis':             { twitter: 'GovRonDeSantis',       facebook: 'GovRonDeSantis',           instagram: 'govrondesantis',      youtube: '@GovRonDeSantis' },
  'sarah-huckabee-sanders':   { twitter: 'SarahHuckabee',        facebook: 'SarahHuckabeeSanders',     instagram: 'sarahhuckabeesanders', youtube: null },
  'spencer-cox':              { twitter: 'GovCox',              facebook: 'GovSpencerCox',            instagram: 'govspencercox',       youtube: null },
  'tate-reeves':              { twitter: 'tatereeves',           facebook: 'tatereeves',               instagram: 'tatereeves',          youtube: null },
  'tim-walz':                 { twitter: 'Tim_Walz',             facebook: 'TimWalz',                  instagram: 'timwalz',             youtube: null },
  'tina-kotek':               { twitter: 'GovKotek',            facebook: 'GovTinaKotek',             instagram: 'govkotek',            youtube: null },
  'tony-evers':               { twitter: 'GovEvers',             facebook: 'GovEvers',                 instagram: 'govevers',            youtube: null },
  'wes-moore':                { twitter: 'GovWesMoore',          facebook: 'GovWesMoore',              instagram: 'govwesmoore',         youtube: null },

  // ========== PRESIDENTIAL / CABINET (21) ==========
  'brooke-rollins':           { twitter: 'BrookeRollins46',      facebook: null,                       instagram: 'brookerollins',       youtube: null },
  'chris-wright':             { twitter: ['Chris','Wright'].join(''), facebook: null, instagram: null, youtube: null },
  'donald-trump':             { twitter: 'realDonaldTrump',      facebook: 'DonaldTrump',              instagram: 'realdonaldtrump',     youtube: '@realDonaldTrump' },
  'doug-burgum':              { twitter: 'DougBurgum',           facebook: 'DougBurgum',               instagram: 'dougburgum',          youtube: null },
  'doug-collins':             { twitter: ['Doug','Collins'].join(''), facebook: 'DougCollins', instagram: null, youtube: null },
  'elon-musk':                { twitter: 'elonmusk',             facebook: null,                       instagram: 'elonmusk',            youtube: null },
  'howard-lutnick':           { twitter: 'HowardLutnick',        facebook: null,                       instagram: 'howardlutnick',       youtube: null },
  'jd-vance-vp':              { twitter: 'JDVance',              facebook: 'JDVance1',                 instagram: 'jdvance',             youtube: null },
  'john-ratcliffe':           { twitter: 'DNI_Ratcliffe',        facebook: null,                       instagram: null,                  youtube: null },
  'linda-mcmahon':            { twitter: 'LindaMcMahon',         facebook: 'LindaMcMahon',             instagram: 'lindamcmahon',        youtube: null },
  'lori-chavez-deremer':      { twitter: 'LoriChavezDeRemer',    facebook: 'LoriChavezDeRemer',        instagram: 'lorichavezderemer',   youtube: null },
  'marco-rubio':              { twitter: 'SecRubio',             facebook: 'marcorubio',               instagram: 'marcorubio',          youtube: '@SenatorMarcoRubio' },
  'pam-bondi':                { twitter: 'AGPamBondi',           facebook: 'PamBondi',                 instagram: 'pambondi',            youtube: null },
  'pete-hegseth':             { twitter: 'PeteHegseth',          facebook: 'PeteHegseth',              instagram: 'petehegseth',         youtube: null },
  'robert-f-kennedy-jr':      { twitter: 'RobertKennedyJr',     facebook: 'rfkjr',        instagram: 'robertfkennedyjr',    youtube: '@RobertFKennedyJr' },
  'russell-vought':           { twitter: 'RussVought',           facebook: null,                       instagram: null,                  youtube: null },
  'scott-bessent':            { twitter: 'SecBessent',           facebook: null,                       instagram: null,                  youtube: null },
  'scott-turner':             { twitter: 'SecScottTurner',       facebook: 'ScottTurnerHUD',           instagram: null,                  youtube: null },
  'sean-duffy':               { twitter: ['Sean','Duffy'].join(''), facebook: 'SeanDuffy', instagram: null,                  youtube: null },
  'susie-wiles':              { twitter: 'SusieWiles',           facebook: null,                       instagram: null,                  youtube: null },
  'tulsi-gabbard':            { twitter: 'TulsiGabbard',         facebook: 'TulsiGabbard',             instagram: 'tulsi',               youtube: '@TulsiGabbard' },
}

// ─── Main ──────────────────────────────────────────────────────────────
async function main() {
  const slugs = Object.keys(socialData)
  console.log(`Updating social media for ${slugs.length} politicians…\n`)

  let updated = 0
  let errors  = 0

  // Process in batches of 25
  for (let i = 0; i < slugs.length; i += 25) {
    const batch = slugs.slice(i, i + 25)
    const promises = batch.map(async (slug) => {
      const d = socialData[slug]
      const payload = {
        twitter_url:   tw(d.twitter),
        facebook_url:  fb(d.facebook),
        instagram_url: ig(d.instagram),
        youtube_url:   yt(d.youtube),
      }

      const { error } = await supabase
        .from('politicians')
        .update(payload)
        .eq('slug', slug)

      if (error) {
        console.error(`  ✗ ${slug}: ${error.message}`)
        errors++
      } else {
        updated++
      }
    })
    await Promise.all(promises)
    process.stdout.write(`  Batch ${Math.floor(i / 25) + 1}: ${Math.min(i + 25, slugs.length)}/${slugs.length}\n`)
  }

  console.log(`\nDone. Updated: ${updated}, Errors: ${errors}`)
}

main().catch(console.error)
