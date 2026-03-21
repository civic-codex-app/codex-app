import { createClient } from '@supabase/supabase-js';

const c = createClient(
  'https://jzxgkvwbhdagqwvisxkt.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6eGdrdndiaGRhZ3F3dmlzeGt0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDA1MjI4MiwiZXhwIjoyMDg5NjI4MjgyfQ.6trLdjlsSeCmQvVbkh1MkK-TGf5fpP_MHTJQ3BbyjcY'
);

// ============================================================
// Social media handles keyed by politician slug
// Format: { twitter, facebook, instagram, youtube }
// Handles are stored without URL prefix — we build full URLs below.
// ============================================================

const SOCIAL = {

  // ============================================================
  // SENATORS (100) — 119th Congress
  // ============================================================

  // Alabama
  'tommy-tuberville': { twitter: 'SenTuberville', facebook: 'SenatorTuberville' },
  'katie-britt': { twitter: 'SenKatieBritt', facebook: 'SenKatieBritt', instagram: 'senkatiebritt' },

  // Alaska
  'lisa-murkowski': { twitter: 'lisamurkowski', facebook: 'SenLisaMurkowski' },
  'dan-sullivan': { twitter: 'SenDanSullivan', facebook: 'SenDanSullivan' },

  // Arizona
  'ruben-gallego': { twitter: 'SenRubenGallego', facebook: 'RubenGallego', instagram: 'rubengallego' },
  'mark-kelly': { twitter: 'SenMarkKelly', facebook: 'CaptMarkKelly', instagram: 'senmarkkelly' },

  // Arkansas
  'john-boozman': { twitter: 'JohnBoozman', facebook: 'JohnBoozman' },
  'tom-cotton': { twitter: 'SenTomCotton', facebook: 'SenatorTomCotton', instagram: 'sentomcotton' },

  // California
  'alex-padilla': { twitter: 'SenAlexPadilla', facebook: 'SenAlexPadilla', instagram: 'senalexpadilla' },
  'adam-schiff': { twitter: 'SenAdamSchiff', facebook: 'RepAdamSchiff', instagram: 'adamschiff' },

  // Colorado
  'michael-bennet': { twitter: 'SenBennetCO', facebook: 'senatorbennet' },
  'john-hickenlooper': { twitter: 'SenatorHick', facebook: 'hickenlooper', instagram: 'johnhickenlooper' },

  // Connecticut
  'richard-blumenthal': { twitter: 'SenBlumenthal', facebook: 'SenBlumenthal' },
  'chris-murphy': { twitter: 'ChrisMurphyCT', facebook: 'ChrisMurphyCT', instagram: 'chrismurphyct' },

  // Delaware
  'lisa-blunt-rochester': { twitter: 'SenBluntRoch', facebook: 'LisaBluntRochester' },
  'chris-coons': { twitter: 'ChrisCoons', facebook: 'ChrisCoons' },

  // Florida
  'ashley-moody': { twitter: 'SenAshleyMoody', facebook: 'AshleyMoodyFL' },
  'rick-scott': { twitter: 'SenRickScott', facebook: 'SenRickScott', instagram: 'senrickscott' },

  // Georgia
  'jon-ossoff': { twitter: 'SenOssoff', facebook: 'SenOssoff', instagram: 'senossoff' },
  'raphael-warnock': { twitter: 'SenatorWarnock', facebook: 'SenatorReverendWarnock', instagram: 'senatorwarnock' },

  // Hawaii
  'mazie-hirono': { twitter: 'maaborehirono', facebook: 'maziehirono' },
  'brian-schatz': { twitter: 'SenBrianSchatz', facebook: 'SenBrianSchatz', instagram: 'senbrianschatz' },

  // Idaho
  'mike-crapo': { twitter: 'MikeCrapo', facebook: 'MikeCrapo' },
  'jim-risch': { twitter: 'SenatorRisch', facebook: 'SenatorJimRisch' },

  // Illinois
  'dick-durbin': { twitter: 'SenatorDurbin', facebook: 'SenatorDurbin', instagram: 'senatordurbin' },
  'tammy-duckworth': { twitter: 'SenDuckworth', facebook: 'SenDuckworth', instagram: 'senduckworth' },

  // Indiana
  'todd-young': { twitter: 'SenToddYoung', facebook: 'SenToddYoung' },
  'jim-banks': { twitter: 'SenJimBanks', facebook: 'RepJimBanks' },

  // Iowa
  'chuck-grassley': { twitter: 'ChuckGrassley', facebook: 'grassley' },
  'joni-ernst': { twitter: 'SenJoniErnst', facebook: 'SenJoniErnst', instagram: 'senjoniernst' },

  // Kansas
  'jerry-moran': { twitter: 'JerryMoran', facebook: 'senatormoran' },
  'roger-marshall': { twitter: 'RogerMarshallMD', facebook: 'RogerMarshallMD' },

  // Kentucky
  'mitch-mcconnell': { twitter: 'LeaderMcConnell', facebook: 'mitchmcconnell' },
  'rand-paul': { twitter: 'RandPaul', facebook: 'RandPaul', instagram: 'senrandpaul', youtube: 'SenatorRandPaul' },

  // Louisiana
  'bill-cassidy': { twitter: 'SenBillCassidy', facebook: 'SenBillCassidy' },
  'john-kennedy': { twitter: 'SenJohnKennedy', facebook: 'SenatorJohnKennedy', instagram: 'senjohnkennedy' },

  // Maine
  'susan-collins': { twitter: 'SenatorCollins', facebook: 'SenatorSusanCollins' },
  'angus-king': { twitter: 'SenAngusKing', facebook: 'SenatorAngusKingJr' },

  // Maryland
  'angela-alsobrooks': { twitter: 'SenAlsobrooks', facebook: 'AngelaAlsobrooks' },
  'chris-van-hollen': { twitter: 'ChrisVanHollen', facebook: 'ChrisVanHollen' },

  // Massachusetts
  'elizabeth-warren': { twitter: 'SenWarren', facebook: 'ElizabethWarren', instagram: 'elizabethwarren', youtube: 'senatorwarren' },
  'ed-markey': { twitter: 'SenMarkey', facebook: 'EdJMarkey', instagram: 'senmarkey' },

  // Michigan
  'gary-peters': { twitter: 'SenGaryPeters', facebook: 'SenGaryPeters' },
  'elissa-slotkin': { twitter: 'SenSlotkin', facebook: 'ElissaSlotkin', instagram: 'elissaslotkin' },

  // Minnesota
  'amy-klobuchar': { twitter: 'amyklobuchar', facebook: 'amyklobuchar', instagram: 'amyklobuchar' },
  'tina-smith': { twitter: 'SenTinaSmith', facebook: 'SenTinaSmith' },

  // Mississippi
  'roger-wicker': { twitter: 'SenatorWicker', facebook: 'SenatorWicker' },
  'cindy-hyde-smith': { twitter: 'SenHydeSmith', facebook: 'SenCindyHydeSmith' },

  // Missouri
  'josh-hawley': { twitter: 'HawleyMO', facebook: 'SenatorHawley', instagram: 'joshhawleymo' },
  'eric-schmitt': { twitter: 'SenEricSchmitt', facebook: 'SenEricSchmitt' },

  // Montana
  'steve-daines': { twitter: 'SteveDaines', facebook: 'SteveDainesMT' },
  'tim-sheehy': { twitter: 'SenTimSheehy', facebook: 'TimSheehyMT' },

  // Nebraska
  'deb-fischer': { twitter: 'SenatorFischer', facebook: 'senatordebfischer' },
  'pete-ricketts': { twitter: 'SenatorRicketts', facebook: 'PeteRicketts' },

  // Nevada
  'catherine-cortez-masto': { twitter: 'SenCortezMasto', facebook: 'SenatorCortezMasto' },
  'jacky-rosen': { twitter: 'SenJackyRosen', facebook: 'SenJackyRosen' },

  // New Hampshire
  'jeanne-shaheen': { twitter: 'SenatorShaheen', facebook: 'SenatorShaheen' },
  'maggie-hassan': { twitter: 'SenatorHassan', facebook: 'SenatorHassan' },

  // New Jersey
  'cory-booker': { twitter: 'CoryBooker', facebook: 'corybooker', instagram: 'corybooker', youtube: 'SenCoryBooker' },
  'andy-kim': { twitter: 'SenAndyKimNJ', facebook: 'AndyKimNJ', instagram: 'andykimnj' },

  // New Mexico
  'martin-heinrich': { twitter: 'MartinHeinrich', facebook: 'MartinHeinrich' },
  'ben-ray-lujan': { twitter: 'SenatorLujan', facebook: 'SenBenRayLujan' },

  // New York
  'chuck-schumer': { twitter: 'SenSchumer', facebook: 'chuckschumer', instagram: 'chuckschumer', youtube: 'SenatorSchumer' },
  'kirsten-gillibrand': { twitter: 'SenGillibrand', facebook: 'KirstenGillibrand', instagram: 'kirstengillibrand' },

  // North Carolina
  'thom-tillis': { twitter: 'SenThomTillis', facebook: 'SenatorThomTillis' },
  'ted-budd': { twitter: 'SenTedBudd', facebook: 'SenTedBudd' },

  // North Dakota
  'john-hoeven': { twitter: 'SenJohnHoeven', facebook: 'SenatorJohnHoeven' },
  'kevin-cramer': { twitter: 'SenKevinCramer', facebook: 'SenKevinCramer' },

  // Ohio
  'bernie-moreno': { twitter: 'SenBernieMoreno', facebook: 'BernieMorenoOH' },
  'jon-husted': { twitter: 'SenJonHusted', facebook: 'JonHusted' },

  // Oklahoma
  'james-lankford': { twitter: 'SenatorLankford', facebook: 'SenatorLankford', instagram: 'senatorlankford' },
  'markwayne-mullin': { twitter: 'SenMullin', facebook: 'SenMullin' },

  // Oregon
  'ron-wyden': { twitter: 'RonWyden', facebook: 'wyden', instagram: 'ronwyden' },
  'jeff-merkley': { twitter: 'SenJeffMerkley', facebook: 'jeffmerkley', instagram: 'jeffmerkley' },

  // Pennsylvania
  'john-fetterman': { twitter: 'SenFettermanPA', facebook: 'JohnFetterman', instagram: 'johnfetterman', youtube: 'SenatorFetterman' },
  'dave-mccormick': { twitter: 'SenMcCormickPA', facebook: 'DaveMcCormickPA' },

  // Rhode Island
  'jack-reed': { twitter: 'SenJackReed', facebook: 'SenJackReed' },
  'sheldon-whitehouse': { twitter: 'SenWhitehouse', facebook: 'SenatorWhitehouse' },

  // South Carolina
  'lindsey-graham': { twitter: 'LindseyGrahamSC', facebook: 'LindseyGrahamSC', instagram: 'lindseygrahamsc' },
  'tim-scott': { twitter: 'SenatorTimScott', facebook: 'SenatorTimScott', instagram: 'senatortimscott', youtube: 'SenatorTimScott' },

  // South Dakota
  'john-thune': { twitter: 'SenJohnThune', facebook: 'SenJohnThune' },
  'mike-rounds': { twitter: 'SenatorRounds', facebook: 'SenatorRounds' },

  // Tennessee
  'marsha-blackburn': { twitter: 'MarshaBlackburn', facebook: 'MarshaBlackburn', instagram: 'marshablackburn' },
  'bill-hagerty': { twitter: 'SenatorHagerty', facebook: 'SenBillHagerty' },

  // Texas
  'ted-cruz': { twitter: 'SenTedCruz', facebook: 'SenatorTedCruz', instagram: 'sentedcruz', youtube: 'SenTedCruz' },
  'john-cornyn': { twitter: 'JohnCornyn', facebook: 'johncornyn' },

  // Utah
  'mike-lee': { twitter: 'SenMikeLee', facebook: 'senatormikelee', instagram: 'senmikelee' },
  'john-curtis': { twitter: 'SenJohnCurtis', facebook: 'RepJohnCurtis' },

  // Vermont
  'bernie-sanders': { twitter: 'SenSanders', facebook: 'senatorsanders', instagram: 'berniesanders', youtube: 'SenSanders' },
  'peter-welch': { twitter: 'SenPeterWelch', facebook: 'PeterWelchVT' },

  // Virginia
  'mark-warner': { twitter: 'MarkWarner', facebook: 'MarkWarner', instagram: 'markwarner' },
  'tim-kaine': { twitter: 'timkaine', facebook: 'TimKaineVA', instagram: 'timkaine' },

  // Washington
  'patty-murray': { twitter: 'PattyMurray', facebook: 'pattymurray' },
  'maria-cantwell': { twitter: 'SenCantwell', facebook: 'senatorcantwell' },

  // West Virginia
  'shelley-moore-capito': { twitter: 'SenCapito', facebook: 'senshelley' },
  'jim-justice': { twitter: 'SenJimJustice', facebook: 'JimJusticeWV' },

  // Wisconsin
  'ron-johnson': { twitter: 'SenRonJohnson', facebook: 'senronjohnson' },
  'tammy-baldwin': { twitter: 'SenatorBaldwin', facebook: 'TammyBaldwin', instagram: 'tammybaldwin' },

  // Wyoming
  'john-barrasso': { twitter: 'SenJohnBarrasso', facebook: 'johnbarrasso' },
  'cynthia-lummis': { twitter: 'SenLummis', facebook: 'SenCynthiaLummis' },

  // ============================================================
  // GOVERNORS (50)
  // ============================================================

  // Alabama
  'kay-ivey': { twitter: 'GovernorKayIvey', facebook: 'GovernorKayIvey' },
  // Alaska
  'mike-dunleavy': { twitter: 'prior', facebook: 'prior' },
  // Arizona
  'katie-hobbs': { twitter: 'GovernorHobbs', facebook: 'KatieHobbs', instagram: 'governorhobbs' },
  // Arkansas
  'sarah-huckabee-sanders': { twitter: 'SarahHuckabee', facebook: 'SarahHuckabeeSanders', instagram: 'sarahhuckabeesanders' },
  // California
  'gavin-newsom': { twitter: 'GavinNewsom', facebook: 'GavinNewsom', instagram: 'gavinnewsom', youtube: 'GavinNewsom' },
  // Colorado
  'jared-polis': { twitter: 'GovofCO', facebook: 'PolisForColorado', instagram: 'jaredpolis' },
  // Connecticut
  'ned-lamont': { twitter: 'GovNedLamont', facebook: 'GovNedLamont' },
  // Delaware
  'matt-meyer': { twitter: 'GovMattMeyer', facebook: 'MattMeyerDE' },
  // Florida
  'ron-desantis': { twitter: 'GovRonDeSantis', facebook: 'RonDeSantis', instagram: 'rondesantis', youtube: 'GovRonDeSantis' },
  // Georgia
  'brian-kemp': { twitter: 'GovKemp', facebook: 'GovKemp', instagram: 'govkemp' },
  // Hawaii
  'josh-green': { twitter: 'GovJoshGreenMD', facebook: 'GovJoshGreen' },
  // Idaho
  'brad-little': { twitter: 'prior', facebook: 'GovernorBradLittle' },
  // Illinois
  'jb-pritzker': { twitter: 'GovPritzker', facebook: 'JBPritzker', instagram: 'govpritzker' },
  // Indiana
  'mike-braun': { twitter: 'GovMikeBraun', facebook: 'MikeBraunIN' },
  // Iowa
  'kim-reynolds': { twitter: 'prior', facebook: 'prior', instagram: 'kimreynoldsia' },
  // Kansas
  'laura-kelly': { twitter: 'GovLauraKelly', facebook: 'GovernorLauraKelly' },
  // Kentucky
  'andy-beshear': { twitter: 'GovAndyBeshear', facebook: 'GovAndyBeshear', instagram: 'govandybeshear' },
  // Louisiana
  'jeff-landry': { twitter: 'LAGovJeffLandry', facebook: 'JeffLandryLA' },
  // Maine
  'janet-mills': { twitter: 'GovJanetMills', facebook: 'GovernorMills' },
  // Maryland
  'wes-moore': { twitter: 'GovWesMoore', facebook: 'iamwesmoore', instagram: 'govwesmoore' },
  // Massachusetts
  'maura-healey': { twitter: 'MassGovernor', facebook: 'MauraHealey', instagram: 'maurahealey' },
  // Michigan
  'gretchen-whitmer': { twitter: 'GovWhitmer', facebook: 'GretchenWhitmer', instagram: 'gretchenwhitmer' },
  // Minnesota
  'tim-walz': { twitter: 'GovTimWalz', facebook: 'GovTimWalz', instagram: 'govtimwalz' },
  // Mississippi
  'tate-reeves': { twitter: 'tatereeves', facebook: 'tatereeves' },
  // Missouri
  'mike-kehoe': { twitter: 'GovMikeKehoe', facebook: 'MikeKehoeMO' },
  // Montana
  'greg-gianforte': { twitter: 'prior', facebook: 'GregForMontana' },
  // Nebraska
  'jim-pillen': { twitter: 'prior', facebook: 'prior' },
  // Nevada
  'joe-lombardo': { twitter: 'prior', facebook: 'prior' },
  // New Hampshire
  'kelly-ayotte': { twitter: 'prior', facebook: 'prior' },
  // New Jersey
  'phil-murphy': { twitter: 'GovMurphy', facebook: 'GovMurphy', instagram: 'govmurphy' },
  // New Mexico
  'michelle-lujan-grisham': { twitter: 'GovMLG', facebook: 'GovMLG', instagram: 'govmlg' },
  // New York
  'kathy-hochul': { twitter: 'GovKathyHochul', facebook: 'GovKathyHochul', instagram: 'govkathyhochul' },
  // North Carolina
  'josh-stein': { twitter: 'GovJoshStein', facebook: 'JoshSteinNC' },
  // North Dakota
  'kelly-armstrong': { twitter: 'prior', facebook: 'prior' },
  // Ohio
  'mike-dewine': { twitter: 'GovMikeDeWine', facebook: 'MikeDeWine', instagram: 'govmikedewine' },
  // Oklahoma
  'kevin-stitt': { twitter: 'GovStitt', facebook: 'GovStitt', instagram: 'govstitt' },
  // Oregon
  'tina-kotek': { twitter: 'GovTinaKotek', facebook: 'TinaKotekOR' },
  // Pennsylvania
  'josh-shapiro': { twitter: 'GovernorShapiro', facebook: 'JoshShapiroPA', instagram: 'governorshapiro' },
  // Rhode Island
  'dan-mckee': { twitter: 'GovDanMcKee', facebook: 'GovDanMcKee' },
  // South Carolina
  'henry-mcmaster': { twitter: 'prior', facebook: 'HenryMcMaster' },
  // South Dakota
  'kristi-noem': { twitter: 'prior', facebook: 'prior' },
  // Tennessee
  'bill-lee': { twitter: 'GovBillLee', facebook: 'GovBillLee', instagram: 'govbilllee' },
  // Texas
  'greg-abbott': { twitter: 'GovAbbott', facebook: 'TexasGovernorAbbott', instagram: 'govabbott', youtube: 'GovAbbott' },
  // Utah
  'spencer-cox': { twitter: 'prior', facebook: 'SpencerCoxUtah' },
  // Vermont
  'phil-scott': { twitter: 'prior', facebook: 'prior' },
  // Virginia
  'glenn-youngkin': { twitter: 'GlennYoungkin', facebook: 'GlennYoungkin', instagram: 'glennyoungkin' },
  // Washington
  'bob-ferguson': { twitter: 'prior', facebook: 'prior' },
  // West Virginia
  'patrick-morrisey': { twitter: 'prior', facebook: 'prior' },
  // Wisconsin
  'tony-evers': { twitter: 'GovEvers', facebook: 'TonyEvers' },
  // Wyoming
  'mark-gordon': { twitter: 'prior', facebook: 'prior' },

  // ============================================================
  // HOUSE REPRESENTATIVES (100)
  // ============================================================

  // Leadership
  'mike-johnson': { twitter: 'SpeakerJohnson', facebook: 'RepMikeJohnson', instagram: 'speakermikejohnson' },
  'hakeem-jeffries': { twitter: 'RepJeffries', facebook: 'RepHakeemJeffries', instagram: 'repjeffries' },
  'steve-scalise': { twitter: 'SteveScalise', facebook: 'RepSteveScalise', instagram: 'stevescalise' },
  'tom-emmer': { twitter: 'GOPMajorityWhip', facebook: 'RepTomEmmer' },
  'katherine-clark': { twitter: 'RepKClark', facebook: 'RepKatherineClark' },
  'pete-aguilar': { twitter: 'RepPeteAguilar', facebook: 'RepPeteAguilar' },

  // High-profile Republicans
  'marjorie-taylor-greene': { twitter: 'RepMTG', facebook: 'RepMTG', instagram: 'repmtg' },
  'jim-jordan': { twitter: 'Jim_Jordan', facebook: 'jimjordan', instagram: 'repjimjordan' },
  'matt-gaetz': { twitter: 'mattgaetz', facebook: 'RepMattGaetz', instagram: 'mattgaetz' },
  'lauren-boebert': { twitter: 'laurenboebert', facebook: 'RepBoebert', instagram: 'laurenboebert' },
  'kevin-mccarthy': { twitter: 'SpeakerMcCarthy', facebook: 'RepKevinMcCarthy' },
  'elise-stefanik': { twitter: 'EliseStefanik', facebook: 'RepEliseStefanik', instagram: 'elisestefanik' },
  'byron-donalds': { twitter: 'prior', facebook: 'RepByronDonalds', instagram: 'repbyrondonalds' },
  'dan-crenshaw': { twitter: 'RepDanCrenshaw', facebook: 'RepDanCrenshaw', instagram: 'repdancrenshaw', youtube: 'DanCrenshawTX' },
  'andy-biggs': { twitter: 'RepAndyBiggsAZ', facebook: 'RepAndyBiggs' },
  'paul-gosar': { twitter: 'RepGosar', facebook: 'RepGosar' },
  'chip-roy': { twitter: 'ChipRoyTX', facebook: 'RepChipRoy' },
  'nancy-mace': { twitter: 'RepNancyMace', facebook: 'NancyMace', instagram: 'repnancymace' },
  'michael-mccaul': { twitter: 'RepMcCaul', facebook: 'RepMcCaul' },
  'patrick-mchenry': { twitter: 'PatrickMcHenry', facebook: 'RepPatrickMcHenry' },
  'jason-smith': { twitter: 'RepJasonSmith', facebook: 'RepJasonSmith' },
  'jodey-arrington': { twitter: 'RepArrington', facebook: 'RepArrington' },
  'mike-rogers-al': { twitter: 'RepMikeRogersAL', facebook: 'CongressmanMikeRogers' },
  'mark-green': { twitter: 'RepMarkGreen', facebook: 'RepMarkGreen' },
  'james-comer': { twitter: 'RepJamesComer', facebook: 'RepJamesComer', instagram: 'repjamescomer' },
  'virginia-foxx': { twitter: 'VirginiaFoxx', facebook: 'RepVirginiaFoxx' },
  'sam-graves': { twitter: 'prior', facebook: 'RepSamGraves' },
  'cathy-mcmorris-rodgers': { twitter: 'prior', facebook: 'prior' },
  'mike-turner': { twitter: 'RepMikeTurner', facebook: 'RepMikeTurner' },
  'bob-good': { twitter: 'RepBobGood', facebook: 'RepBobGood' },
  'anna-paulina-luna': { twitter: 'prior', facebook: 'prior' },
  'wesley-hunt': { twitter: 'RepWesleyHunt', facebook: 'RepWesleyHunt' },
  'mike-waltz': { twitter: 'RepWaltz', facebook: 'RepMikeWaltz' },
  'thomas-massie': { twitter: 'RepThomasMassie', facebook: 'RepThomasMassie', instagram: 'repthomasmassie' },

  // High-profile Democrats
  'alexandria-ocasio-cortez': { twitter: 'AOC', facebook: 'OcasioCortez', instagram: 'aoc', youtube: 'AlexandriaOcasioCortez' },
  'nancy-pelosi': { twitter: 'SpeakerPelosi', facebook: 'NancyPelosi', instagram: 'nancypelosi' },
  'jim-clyburn': { twitter: 'RepJamesClyburn', facebook: 'jimclyburn' },
  'ilhan-omar': { twitter: 'IlhanMN', facebook: 'RepIlhanOmar', instagram: 'ilhanmn' },
  'rashida-tlaib': { twitter: 'RepRashida', facebook: 'RepRashidaTlaib', instagram: 'rashidatlaib' },
  'ayanna-pressley': { twitter: 'RepPressley', facebook: 'RepAyannaPressley', instagram: 'ayannapressley' },
  'ro-khanna': { twitter: 'RepRoKhanna', facebook: 'RepRoKhanna', instagram: 'reprokhanna' },
  'jamie-raskin': { twitter: 'RepRaskin', facebook: 'RepJamieRaskin', instagram: 'repraskin' },
  'maxine-waters': { twitter: 'RepMaxineWaters', facebook: 'MaxineWaters' },
  'jerry-nadler': { twitter: 'RepJerryNadler', facebook: 'CongressmanNadler' },
  'adam-smith': { twitter: 'RepAdamSmith', facebook: 'RepAdamSmith' },
  'pramila-jayapal': { twitter: 'RepJayapal', facebook: 'RepJayapal', instagram: 'repjayapal' },
  'gregory-meeks': { twitter: 'RepGregoryMeeks', facebook: 'RepGregoryMeeks' },
  'steny-hoyer': { twitter: 'LeaderHoyer', facebook: 'WhipHoyer' },
  'debbie-wasserman-schultz': { twitter: 'DWStweets', facebook: 'DWStweets' },
  'ted-lieu': { twitter: 'RepTedLieu', facebook: 'RepTedLieu', instagram: 'reptedlieu' },
  'eric-swalwell': { twitter: 'RepSwalwell', facebook: 'CongressmanEricSwalwell', instagram: 'ericswalwell' },
  'ritchie-torres': { twitter: 'RepRitchie', facebook: 'RepRitchieTorres', instagram: 'repritchie' },
  'jasmine-crockett': { twitter: 'RepJasmine', facebook: 'RepJasmineCrockett', instagram: 'repjasmine' },
  'maxwell-frost': { twitter: 'RepMaxwellFrost', facebook: 'MaxwellFrostFL', instagram: 'repmaxwellfrost' },
  'jared-moskowitz': { twitter: 'JaredEMoskowitz', facebook: 'JaredMoskowitzFL' },
  'robert-garcia': { twitter: 'RepRobertGarcia', facebook: 'RepRobertGarcia', instagram: 'reprobertgarcia' },

  // Additional notable members
  'liz-cheney': { twitter: 'Liz_Cheney', facebook: 'RepLizCheney' },
  'joaquin-castro': { twitter: 'JoaquinCastrotx', facebook: 'RepJoaquinCastro' },
  'tony-gonzales': { twitter: 'RepTonyGonzales', facebook: 'RepTonyGonzales' },
  'don-bacon': { twitter: 'RepDonBacon', facebook: 'RepDonBacon' },
  'brian-fitzpatrick': { twitter: 'RepBrianFitz', facebook: 'RepBrianFitzpatrick' },
  'josh-gottheimer': { twitter: 'RepJoshG', facebook: 'RepJoshGottheimer' },
  'abigail-spanberger': { twitter: 'RepSpanberger', facebook: 'RepSpanberger' },
  'mikie-sherrill': { twitter: 'RepSherrill', facebook: 'RepMikieSherrill' },
  'veronica-escobar': { twitter: 'RepEscobar', facebook: 'RepEscobar' },
  'frederica-wilson': { twitter: 'RepWilson', facebook: 'RepWilson' },
  'suzan-delbene': { twitter: 'RepDelBene', facebook: 'RepDelBene' },
  'cori-bush': { twitter: 'RepCori', facebook: 'RepCoriBush', instagram: 'repcori' },
  'sheila-jackson-lee': { twitter: 'JacksonLeeTX18', facebook: 'JacksonLee18' },
  'mark-takano': { twitter: 'RepMarkTakano', facebook: 'RepMarkTakano' },
  'barbara-lee': { twitter: 'RepBarbaraLee', facebook: 'RepBarbaraLee' },

  // More Republicans
  'ralph-norman': { twitter: 'RepRalphNorman', facebook: 'RepRalphNorman' },
  'scott-perry': { twitter: 'RepScottPerry', facebook: 'RepScottPerry' },
  'barry-loudermilk': { twitter: 'RepLoudermilk', facebook: 'RepLoudermilk' },
  'troy-nehls': { twitter: 'RepTroyNehls', facebook: 'RepTroyNehls' },
  'beth-van-duyne': { twitter: 'RepBethVanDuyne', facebook: 'RepBethVanDuyne' },
  'maria-elvira-salazar': { twitter: 'RepMariaSalazar', facebook: 'RepMariaSalazar' },
  'carlos-gimenez': { twitter: 'RepCarlos', facebook: 'RepCarlosGimenez' },
  'mike-garcia': { twitter: 'RepMikeGarcia', facebook: 'RepMikeGarcia' },
  'young-kim': { twitter: 'RepYoungKim', facebook: 'RepYoungKim' },
  'nicole-malliotakis': { twitter: 'prior', facebook: 'prior' },
  'mike-lawler': { twitter: 'RepMikeLawler', facebook: 'RepMikeLawler', instagram: 'repmikelawler' },
  'nick-lalota': { twitter: 'RepNickLaLota', facebook: 'RepNickLaLota' },
  'brandon-williams': { twitter: 'prior', facebook: 'prior' },

  // More Democrats
  'joe-neguse': { twitter: 'RepJoeNeguse', facebook: 'RepJoeNeguse' },
  'jim-mcgovern': { twitter: 'RepMcGovern', facebook: 'RepJimMcGovern' },
  'bennie-thompson': { twitter: 'BennieGThompson', facebook: 'RepBennieThompson' },
  'rosa-delauro': { twitter: 'RosaDeLauro', facebook: 'CongresswomanDeLauro' },
  'gerry-connolly': { twitter: 'GerryConnolly', facebook: 'CongressmanGerryConnolly' },
  'lloyd-doggett': { twitter: 'RepDoggett', facebook: 'RepLloydDoggett' },
  'raja-krishnamoorthi': { twitter: 'CongressmanRaja', facebook: 'CongressmanRaja' },
  'seth-moulton': { twitter: 'sethmoulton', facebook: 'RepSethMoulton' },
  'val-demings': { twitter: 'ValDemings', facebook: 'RepValDemings' },
  'colin-allred': { twitter: 'ColinAllredTX', facebook: 'ColinAllredTX', instagram: 'colinallredtx' },
  'sara-jacobs': { twitter: 'RepSaraJacobs', facebook: 'RepSaraJacobs' },
  'summer-lee': { twitter: 'RepSummerLee', facebook: 'RepSummerLee' },
  'mary-gay-scanlon': { twitter: 'RepMGS', facebook: 'RepMGS' },
};

// ============================================================
// Main loader
// ============================================================
async function run() {
  console.log('=== Codex Social Media URL Loader ===\n');

  // 1. Check if social media columns exist
  console.log('Checking if social media columns exist...');
  const { data: testRow, error: testErr } = await c
    .from('politicians')
    .select('twitter_url')
    .limit(1);

  if (testErr) {
    console.error('\n*** ERROR: Social media columns do not exist yet! ***');
    console.error('Please run the migration first:');
    console.error('  psql < supabase/005_social_media.sql');
    console.error('  — or apply it via the Supabase dashboard SQL editor.\n');
    console.error('Technical error:', testErr.message);
    process.exit(1);
  }
  console.log('Columns exist.\n');

  // 2. Fetch all politicians
  const { data: politicians, error: fetchErr } = await c
    .from('politicians')
    .select('id, name, slug, party, chamber');

  if (fetchErr) {
    console.error('Failed to fetch politicians:', fetchErr.message);
    process.exit(1);
  }

  const mapSize = Object.keys(SOCIAL).filter(k => {
    const s = SOCIAL[k];
    return (s.twitter && s.twitter !== 'prior') || (s.facebook && s.facebook !== 'prior');
  }).length;

  console.log(`Loaded ${politicians.length} politicians from database.`);
  console.log(`Social map has ${mapSize} entries with real handles.\n`);

  // 3. Match and update
  let updated = 0;
  let skipped = 0;
  let errors = 0;
  const notInMap = [];

  for (const pol of politicians) {
    const social = SOCIAL[pol.slug];
    if (!social) {
      notInMap.push(pol.slug);
      skipped++;
      continue;
    }

    const updates = {};
    if (social.twitter && social.twitter !== 'prior')
      updates.twitter_url = `https://x.com/${social.twitter}`;
    if (social.facebook && social.facebook !== 'prior')
      updates.facebook_url = `https://facebook.com/${social.facebook}`;
    if (social.instagram && social.instagram !== 'prior')
      updates.instagram_url = `https://instagram.com/${social.instagram}`;
    if (social.youtube && social.youtube !== 'prior')
      updates.youtube_url = `https://youtube.com/@${social.youtube}`;
    if (social.threads && social.threads !== 'prior')
      updates.threads_url = `https://threads.net/@${social.threads}`;

    if (Object.keys(updates).length === 0) {
      skipped++;
      continue;
    }

    const { error: updateErr } = await c
      .from('politicians')
      .update(updates)
      .eq('id', pol.id);

    if (updateErr) {
      console.error(`  ERROR updating ${pol.name}: ${updateErr.message}`);
      errors++;
    } else {
      updated++;
      const platforms = Object.keys(updates).map(k => k.replace('_url', '')).join(', ');
      console.log(`  Updated ${pol.name} — ${platforms}`);
    }
  }

  // 4. Summary
  console.log('\n=== Summary ===');
  console.log(`  Updated: ${updated}`);
  console.log(`  Skipped (no map entry or no real handles): ${skipped}`);
  console.log(`  Errors:  ${errors}`);

  if (notInMap.length > 0) {
    console.log(`\n  Politicians not in social map (${notInMap.length}):`);
    for (const slug of notInMap) {
      console.log(`    - ${slug}`);
    }
  }

  // 5. Verify
  const { count: twitterCount } = await c
    .from('politicians')
    .select('*', { count: 'exact', head: true })
    .not('twitter_url', 'is', null);

  const { count: fbCount } = await c
    .from('politicians')
    .select('*', { count: 'exact', head: true })
    .not('facebook_url', 'is', null);

  const { count: igCount } = await c
    .from('politicians')
    .select('*', { count: 'exact', head: true })
    .not('instagram_url', 'is', null);

  const { count: ytCount } = await c
    .from('politicians')
    .select('*', { count: 'exact', head: true })
    .not('youtube_url', 'is', null);

  console.log(`\n=== Verification ===`);
  console.log(`  Politicians with Twitter URL:   ${twitterCount}`);
  console.log(`  Politicians with Facebook URL:  ${fbCount}`);
  console.log(`  Politicians with Instagram URL: ${igCount}`);
  console.log(`  Politicians with YouTube URL:   ${ytCount}`);
  console.log('\nDone!');
}

run().catch(console.error);
