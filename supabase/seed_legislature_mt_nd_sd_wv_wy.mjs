// Seed script: Fill missing state legislators for MT, ND, SD, WV, WY
// Queries existing members first, then inserts only missing ones
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const env = readFileSync('.env.local', 'utf8')
const vars = {}
for (const line of env.split('\n')) {
  const [k, ...v] = line.split('=')
  if (k && !k.startsWith('#')) vars[k.trim()] = v.join('=').trim()
}

const supabase = createClient(vars.NEXT_PUBLIC_SUPABASE_URL, vars.SUPABASE_SERVICE_ROLE_KEY)

function slugify(name) {
  return name.toLowerCase().replace(/['']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

// ════════════════════════════════════════════════════════════════
// MONTANA — 50 senate seats, 100 house seats
// ════════════════════════════════════════════════════════════════

const mtSenators = [
  // Already seeded: Ellsworth, Fitzpatrick, Hertz, Keenan, C.Smith, Friedel, Emrich, Ankney,
  // Mandeville, Trebas, Regier, Bogner, Lang, Tempel, Sales, Vance, Hinebauch, Gauthier,
  // McGillvray, Molnar, Glimm, Lenz, Boldman, Ellis, Olsen, Pope, Hayman, McClafferty,
  // Dunwell, Flowers, O'Brien, Webber
  // Missing senators:
  { name: 'Jason Small', district: 21, party: 'republican' },
  { name: 'Barry Usher', district: 24, party: 'republican' },
  { name: 'Chris Dorrington', district: 30, party: 'republican' },
  { name: 'Dennis Iverson', district: 26, party: 'republican' },
  { name: 'Daniel Salomon', district: 7, party: 'republican' },
  { name: 'Ellie Hill Boldman', district: 46, party: 'democrat' },
  { name: 'Becky Beard', district: 22, party: 'republican' },
  { name: 'Jeff Welborn', district: 36, party: 'republican' },
  { name: 'Josh Kassmier', district: 16, party: 'republican' },
  { name: 'Kenneth Toole', district: 44, party: 'democrat' },
  { name: 'Terry Vermeire', district: 29, party: 'republican' },
  { name: 'Mike Fox', district: 31, party: 'republican' },
  { name: 'John Fuller', district: 8, party: 'republican' },
  { name: 'Daniel Zolnikov', district: 37, party: 'republican' },
  { name: 'Theresa Manzella', district: 44, party: 'republican' },
  { name: 'Shane Morigeau', district: 47, party: 'democrat' },
  { name: 'Mark Sweeney', district: 25, party: 'republican' },
  { name: 'Tom Jacobson', district: 9, party: 'democrat' },
]

const mtReps = [
  // Already seeded: M.Regier, Ler, Mercer, Knudsen, Bedey, Buttrey, Schillinger,
  // Hamilton, Windy Boy, Howell, Zephyr, Buckley, Stafman, Bertoglio
  // Missing house members:
  { name: 'Sue Vinton', district: 56, party: 'republican' },
  { name: 'Llew Jones', district: 18, party: 'republican' },
  { name: 'Frank Garner', district: 7, party: 'republican' },
  { name: 'Dennis Lenz', district: 43, party: 'republican' },
  { name: 'Mike Hopkins', district: 92, party: 'republican' },
  { name: 'Rhonda Knudsen', district: 34, party: 'republican' },
  { name: 'Brad Tschida', district: 97, party: 'republican' },
  { name: 'Lola Galloway', district: 84, party: 'republican' },
  { name: 'Steve Gist', district: 75, party: 'republican' },
  { name: 'Gary Parry', district: 77, party: 'republican' },
  { name: 'Jodee Etchart', district: 22, party: 'republican' },
  { name: 'Jennifer Carlson', district: 66, party: 'republican' },
  { name: 'Eric Matthews', district: 79, party: 'republican' },
  { name: 'Ross Fitzgerald', district: 23, party: 'republican' },
  { name: 'Courtenay Sprunger', district: 53, party: 'republican' },
  { name: 'John Fitzpatrick', district: 19, party: 'republican' },
  { name: 'Neil Duram', district: 2, party: 'republican' },
  { name: 'Braxton Mitchell', district: 67, party: 'republican' },
  { name: 'Greg DeVries', district: 55, party: 'republican' },
  { name: 'Tony Brockman', district: 76, party: 'republican' },
  { name: 'Denley Loge', district: 14, party: 'republican' },
  { name: 'Mike Yakawich', district: 45, party: 'republican' },
  { name: 'Larry Brewster', district: 71, party: 'republican' },
  { name: 'Bob Phalen', district: 36, party: 'republican' },
  { name: 'Steve Galloway', district: 24, party: 'republican' },
  { name: 'Ron Marshall', district: 76, party: 'republican' },
  { name: 'Josh Kassmier', district: 15, party: 'republican' },
  { name: 'Scot Kerns', district: 58, party: 'republican' },
  { name: 'Paul Fielder', district: 13, party: 'republican' },
  { name: 'Marvin Weatherwax', district: 15, party: 'democrat' },
  { name: 'Jonathan Karlen', district: 63, party: 'democrat' },
  { name: 'Danny Tenenbaum', district: 95, party: 'democrat' },
  { name: 'Mary Caferro', district: 81, party: 'democrat' },
  { name: 'Laurie Bishop', district: 60, party: 'democrat' },
  { name: 'Tom France', district: 90, party: 'democrat' },
  { name: 'Jade Bahr', district: 86, party: 'democrat' },
  { name: 'Shane Morigeau', district: 93, party: 'democrat' },
  { name: 'Andrea Olsen', district: 100, party: 'democrat' },
  { name: 'Connie Keogh', district: 85, party: 'democrat' },
  { name: 'Dave Fern', district: 10, party: 'democrat' },
  { name: 'Denise Hayman', district: 65, party: 'democrat' },
  { name: 'Emma Kerr-Carpenter', district: 49, party: 'democrat' },
  { name: 'Marta Bertoglio', district: 98, party: 'democrat' },
  { name: 'Mike Yakawich', district: 46, party: 'republican' },
  { name: 'Jessica Karjala', district: 48, party: 'democrat' },
  { name: 'Mark Thane', district: 93, party: 'democrat' },
  { name: 'Willis Curdy', district: 98, party: 'democrat' },
  { name: 'Michele Leslieewski', district: 88, party: 'democrat' },
  { name: 'George Nikolakakos', district: 47, party: 'republican' },
  { name: 'Bill Usher', district: 69, party: 'republican' },
  { name: 'Terry Moore', district: 12, party: 'republican' },
  { name: 'Bob Keenan', district: 10, party: 'republican' },
  { name: 'Jedediah Hinkle', district: 68, party: 'republican' },
  { name: 'Jane Gillette', district: 64, party: 'republican' },
  { name: 'Mark Noland', district: 11, party: 'republican' },
  { name: 'Gregory Frazer', district: 32, party: 'republican' },
  { name: 'Caleb Hinkle', district: 68, party: 'republican' },
  { name: 'Nelly Nicol', district: 6, party: 'republican' },
  { name: 'Kerri Seekins-Crowe', district: 51, party: 'republican' },
  { name: 'Lyn Hellegaard', district: 56, party: 'republican' },
  { name: 'Steve Gunderson', district: 1, party: 'republican' },
  { name: 'Sherry Essmann', district: 54, party: 'republican' },
  { name: 'Amy Regier', district: 5, party: 'republican' },
  { name: 'Lori Faye Sheldon-Galloway', district: 52, party: 'republican' },
  { name: 'Jerry Schillinger', district: 50, party: 'republican' },
  { name: 'Lee Deming', district: 40, party: 'republican' },
  { name: 'Gary Kamps', district: 73, party: 'republican' },
  { name: 'Brian Putnam', district: 42, party: 'republican' },
  { name: 'Mike Piet', district: 27, party: 'republican' },
  { name: 'Joe Read', district: 3, party: 'republican' },
  { name: 'John Read', district: 74, party: 'republican' },
  { name: 'Tanner Smith', district: 37, party: 'republican' },
  { name: 'Katie Zolnikov', district: 39, party: 'republican' },
  { name: 'Donavon Hawk', district: 16, party: 'republican' },
  { name: 'Bob Gunderson', district: 1, party: 'republican' },
  { name: 'Cody Finkbeiner', district: 91, party: 'republican' },
  { name: 'Kenneth Walsh', district: 71, party: 'republican' },
  { name: 'Jane Rectenwald', district: 28, party: 'republican' },
  { name: 'Alan Redfield', district: 59, party: 'republican' },
  { name: 'Lee Whitcomb', district: 30, party: 'republican' },
  { name: 'Dan Bartel', district: 29, party: 'republican' },
  { name: 'Fred Anderson', district: 21, party: 'republican' },
  { name: 'Rebecca Schmitz', district: 89, party: 'democrat' },
  { name: 'Mary Ann Dunwell', district: 84, party: 'democrat' },
  { name: 'Katie Sullivan', district: 83, party: 'democrat' },
  { name: 'Moffie Funk', district: 82, party: 'democrat' },
  { name: 'Tyson Running Wolf', district: 9, party: 'democrat' },
]

// ════════════════════════════════════════════════════════════════
// NORTH DAKOTA — 47 senate seats, 94 house seats (2 per district)
// ════════════════════════════════════════════════════════════════

const ndSenators = [
  // Already seeded: Hogue, Klein, Holmberg, Bekkedahl, Patten, Clemens, Dever,
  // Schaible, D.Larsen, Elkin, Magrum, Myrdal, Weston, Luick, M.Weber, Poolman,
  // Wardner, S.Meyer, Wanzek, Mathern, Potter, Hogan, Bakke, Oban, Piepkorn
  // Missing senators:
  { name: 'David Rust', district: 2, party: 'republican' },
  { name: 'Cole Christensen', district: 24, party: 'republican' },
  { name: 'Curt Kreun', district: 42, party: 'republican' },
  { name: 'Dean Rummel', district: 26, party: 'republican' },
  { name: 'Jeff Barta', district: 4, party: 'republican' },
  { name: 'Jim Roers', district: 46, party: 'republican' },
  { name: 'Judy Lee', district: 13, party: 'republican' },
  { name: 'Kristin Roers', district: 27, party: 'republican' },
  { name: 'Michael Dwyer', district: 6, party: 'republican' },
  { name: 'Mike Wobbema', district: 23, party: 'republican' },
  { name: 'Michelle Axtman', district: 45, party: 'democrat' },
  { name: 'Robert Erbele', district: 28, party: 'republican' },
  { name: 'Ryan Braunberger', district: 19, party: 'democrat' },
  { name: 'Sean Cleary', district: 35, party: 'democrat' },
  { name: 'Shawn Vedaa', district: 6, party: 'republican' },
  { name: 'Spencer Berry', district: 36, party: 'republican' },
  { name: 'Todd Beard', district: 20, party: 'republican' },
  { name: 'Dale Patten', district: 40, party: 'republican' },
  { name: 'Greg Kessel', district: 3, party: 'republican' },
  { name: 'Kevin Cramer', district: 12, party: 'republican' },
  { name: 'Liz Brocker', district: 33, party: 'republican' },
  { name: 'Randy Lemm', district: 41, party: 'republican' },
]

const ndReps = [
  // Already seeded: Lefor, D.Johnson, Koppelman, Klemin, Ruby, Hoverson,
  // Becker, Louser, Roers Jones, Vetter, Beadle, Hanson, Mock, Boschee,
  // Dobervich, Schneider
  // Missing house members:
  { name: 'Mike Nathe', district: 30, party: 'republican' },
  { name: 'Chet Pollert', district: 29, party: 'republican' },
  { name: 'Craig Headland', district: 29, party: 'republican' },
  { name: 'Al Carlson', district: 41, party: 'republican' },
  { name: 'Bill Devlin', district: 23, party: 'republican' },
  { name: 'Bill Tveit', district: 33, party: 'republican' },
  { name: 'Bob Martinson', district: 35, party: 'republican' },
  { name: 'Brandy Pyle', district: 22, party: 'republican' },
  { name: 'Claire Cory', district: 42, party: 'republican' },
  { name: 'Clayton Fegley', district: 43, party: 'republican' },
  { name: 'Cynthia Schreiber-Beck', district: 25, party: 'republican' },
  { name: 'Dori Hauck', district: 31, party: 'republican' },
  { name: 'David Richter', district: 1, party: 'republican' },
  { name: 'David Vigesaa', district: 23, party: 'republican' },
  { name: 'Donald Longmuir', district: 32, party: 'republican' },
  { name: 'Eric James Murphy', district: 20, party: 'republican' },
  { name: 'Glenn Bosch', district: 30, party: 'republican' },
  { name: 'Greg Stemen', district: 28, party: 'republican' },
  { name: 'Jared Hagert', district: 26, party: 'republican' },
  { name: 'Jason Dockter', district: 7, party: 'republican' },
  { name: 'Jeff Magrum', district: 8, party: 'republican' },
  { name: 'Jim Jonas', district: 24, party: 'republican' },
  { name: 'Jim Kasper', district: 46, party: 'republican' },
  { name: 'Jim Schmidt', district: 31, party: 'republican' },
  { name: 'Jorin Johnson', district: 27, party: 'republican' },
  { name: 'Jon Nelson', district: 7, party: 'republican' },
  { name: 'Karen Anderson', district: 33, party: 'republican' },
  { name: 'Karen Karls', district: 35, party: 'republican' },
  { name: 'Karen Rohr', district: 31, party: 'republican' },
  { name: 'Kelby Timmons', district: 40, party: 'republican' },
  { name: 'Keith Kempenich', district: 39, party: 'republican' },
  { name: 'Kris Wallman', district: 11, party: 'democrat' },
  { name: 'Lois Delmore', district: 43, party: 'democrat' },
  { name: 'Lisa Meier', district: 32, party: 'republican' },
  { name: 'Mark Owens', district: 17, party: 'republican' },
  { name: 'Mark Sanford', district: 17, party: 'republican' },
  { name: 'Matt Heilman', district: 13, party: 'republican' },
  { name: 'Matthew Schobinger', district: 14, party: 'republican' },
  { name: 'Mike Beltz', district: 36, party: 'republican' },
  { name: 'Michelle Strinden', district: 47, party: 'republican' },
  { name: 'Mike Motschenbacher', district: 6, party: 'republican' },
  { name: 'Pat Heinert', district: 34, party: 'republican' },
  { name: 'Randy Schobinger', district: 14, party: 'republican' },
  { name: 'SuAnn Olson', district: 8, party: 'republican' },
  { name: 'Robin Weisz', district: 14, party: 'republican' },
  { name: 'Scott Wagner', district: 40, party: 'republican' },
  { name: 'Todd Porter', district: 34, party: 'republican' },
  { name: 'Vicky Steiner', district: 37, party: 'republican' },
  { name: 'Wayne Trottier', district: 19, party: 'republican' },
  { name: 'Alisa Mitskog', district: 25, party: 'democrat' },
  { name: 'Zac Ista', district: 43, party: 'democrat' },
  { name: 'Lisa Finley-DeVille', district: 4, party: 'democrat' },
  { name: 'Emily OBrien', district: 42, party: 'democrat' },
  { name: 'Janice Bower', district: 45, party: 'democrat' },
  { name: 'LaurieBeth Hager', district: 21, party: 'democrat' },
  { name: 'Ruth Buffalo', district: 27, party: 'democrat' },
  { name: 'SuAnn Olson', district: 9, party: 'republican' },
  { name: 'Andrew Marschall', district: 36, party: 'republican' },
  { name: 'Austen Schauer', district: 12, party: 'republican' },
  { name: 'Ben Koppelman', district: 16, party: 'republican' },
  { name: 'Bernie Satrom', district: 12, party: 'republican' },
  { name: 'Bob Paulson', district: 3, party: 'republican' },
  { name: 'Carrie McLeod', district: 1, party: 'republican' },
  { name: 'Daniel Johnston', district: 24, party: 'republican' },
  { name: 'David Nehring', district: 28, party: 'republican' },
  { name: 'Donna Henderson', district: 2, party: 'republican' },
  { name: 'Gary Kreidt', district: 33, party: 'republican' },
  { name: 'Gretchen Dobervich', district: 11, party: 'democrat' },
  { name: 'Hamida Dakane', district: 10, party: 'democrat' },
  { name: 'Jay Fisher', district: 9, party: 'republican' },
  { name: 'Jeremy Olson', district: 45, party: 'republican' },
  { name: 'Jim Grueneich', district: 15, party: 'republican' },
  { name: 'Jon O. Nelson', district: 7, party: 'republican' },
  { name: 'Jonathan Sickler', district: 41, party: 'republican' },
  { name: 'Kathy Skroch', district: 26, party: 'republican' },
  { name: 'Mitch Ostlie', district: 19, party: 'democrat' },
  { name: 'Nathan Toman', district: 34, party: 'republican' },
  { name: 'Sebastian Ertelt', district: 10, party: 'republican' },
]

// ════════════════════════════════════════════════════════════════
// SOUTH DAKOTA — 35 senate seats, 70 house seats (2 per district)
// ════════════════════════════════════════════════════════════════

const sdSenators = [
  // Already seeded: Schoenbeck, Crabtree, Novstrup, Beal, Wheeler, Tobin, Cammack,
  // Otten, Kolbeck, Hunhoff, Bolin, Mehlhaff, Frye-Mueller, Zikmund, Duvall, Rohl,
  // Deibert, Reed, Pischke, Heinert, Nesiba, Foster, Bordeaux
  // Missing senators:
  { name: 'Mike Rohl', district: 2, party: 'republican' },
  { name: 'Jessica Castleberry', district: 35, party: 'republican' },
  { name: 'Bryan Breitling', district: 9, party: 'republican' },
  { name: 'David Johnson', district: 33, party: 'republican' },
  { name: 'Helene Duhamel', district: 32, party: 'republican' },
  { name: 'Jim Stalzer', district: 11, party: 'republican' },
  { name: 'John Wiik', district: 4, party: 'republican' },
  { name: 'Joshua Klumb', district: 20, party: 'republican' },
  { name: 'Kevin Jensen', district: 17, party: 'republican' },
  { name: 'Kyle Schoenfish', district: 19, party: 'republican' },
  { name: 'Liz Larson', district: 10, party: 'republican' },
  { name: 'Reynold Nesiba', district: 15, party: 'democrat' },
]

const sdReps = [
  // Already seeded: Bartels, J.Hansen, Gosch, Karr, Deutsch, K.Peterson, Derby,
  // S.Peterson, Rehfeldt, Mortenson, Duba, Lesmeister, Pourier, Wittman
  // Missing house members:
  { name: 'Mike Stevens', district: 18, party: 'republican' },
  { name: 'Jamie Smith', district: 15, party: 'democrat' },
  { name: 'Aaron Aylward', district: 6, party: 'republican' },
  { name: 'Arch Beal', district: 12, party: 'republican' },
  { name: 'Becky Drury', district: 14, party: 'republican' },
  { name: 'Bethany Soye', district: 11, party: 'republican' },
  { name: 'Brian Mulder', district: 32, party: 'republican' },
  { name: 'Caleb Finck', district: 21, party: 'republican' },
  { name: 'Charlie Hoffman', district: 23, party: 'republican' },
  { name: 'Chris Karr', district: 11, party: 'republican' },
  { name: 'Curt Massie', district: 34, party: 'republican' },
  { name: 'Drew Dennert', district: 3, party: 'republican' },
  { name: 'Ernie Otten', district: 6, party: 'republican' },
  { name: 'Gary Drewes', district: 1, party: 'republican' },
  { name: 'Greg Jamison', district: 12, party: 'republican' },
  { name: 'Jess Olson', district: 34, party: 'republican' },
  { name: 'John Mills', district: 8, party: 'republican' },
  { name: 'John Sjaarda', district: 35, party: 'republican' },
  { name: 'Jon Hansen', district: 25, party: 'republican' },
  { name: 'Kevin Jensen', district: 17, party: 'republican' },
  { name: 'Kirk Chaffee', district: 29, party: 'republican' },
  { name: 'Lana Greenfield', district: 2, party: 'republican' },
  { name: 'Larry Tidemann', district: 7, party: 'republican' },
  { name: 'Liz May', district: 27, party: 'republican' },
  { name: 'Lynn Schneider', district: 22, party: 'republican' },
  { name: 'Mary Fitzgerald', district: 35, party: 'republican' },
  { name: 'Mike Derby', district: 3, party: 'republican' },
  { name: 'Mike Weisgram', district: 24, party: 'republican' },
  { name: 'Nico Varilek', district: 15, party: 'democrat' },
  { name: 'Phil Jensen', district: 33, party: 'republican' },
  { name: 'Rebecca Reimer', district: 26, party: 'republican' },
  { name: 'Rocky Blare', district: 33, party: 'republican' },
  { name: 'Roger Chase', district: 22, party: 'republican' },
  { name: 'Ryan Cwach', district: 18, party: 'democrat' },
  { name: 'Scott Odenbach', district: 31, party: 'republican' },
  { name: 'Sydney Davis', district: 10, party: 'republican' },
  { name: 'Taylor Rehfeldt', district: 14, party: 'republican' },
  { name: 'Tim Goodwin', district: 30, party: 'republican' },
  { name: 'Tim Rounds', district: 24, party: 'republican' },
  { name: 'Tony Venhuizen', district: 13, party: 'republican' },
  { name: 'Trish Ladner', district: 30, party: 'republican' },
  { name: 'Will Mortenson', district: 24, party: 'republican' },
  { name: 'Erin Healy', district: 10, party: 'democrat' },
  { name: 'Jennifer Keintz', district: 20, party: 'democrat' },
  { name: 'Ryan Braunberger', district: 9, party: 'republican' },
  { name: 'Steven McCleerey', district: 1, party: 'democrat' },
  { name: 'Tamara St. John', district: 28, party: 'republican' },
  { name: 'Mike Karr', district: 16, party: 'republican' },
  { name: 'David Kull', district: 20, party: 'republican' },
  { name: 'Mark Mowry', district: 31, party: 'republican' },
  { name: 'Randy Gross', district: 19, party: 'republican' },
  { name: 'Tyler Tordsen', district: 7, party: 'republican' },
  { name: 'Marli Wiese', district: 9, party: 'republican' },
  { name: 'Collin Drury', district: 5, party: 'republican' },
  { name: 'Herman Otten', district: 6, party: 'republican' },
  { name: 'Nico LaFave', district: 32, party: 'republican' },
]

// ════════════════════════════════════════════════════════════════
// WEST VIRGINIA — 34 senate seats, 100 house (delegate) seats
// ════════════════════════════════════════════════════════════════

const wvSenators = [
  // Already seeded: Blair, Takubo, Weld, C.Trump, Stover, Tarr, Woodrum,
  // J.Taylor, Maynard, Maroney, Oliverio, Roberts, Phillips, Deeds,
  // Grady, B.Hamilton, Azinger, R.Smith, Karnes, B.Smith, Jeffries,
  // Woelfel, Lindsay, Plymale, Ihlenfeld
  // Missing senators:
  { name: 'Mark Hunt', district: 10, party: 'republican' },
  { name: 'Patrick Martin', district: 12, party: 'republican' },
  { name: 'Donna Boley', district: 3, party: 'republican' },
  { name: 'Mike Stuart', district: 6, party: 'republican' },
  { name: 'Chandler Swain', district: 6, party: 'republican' },
  { name: 'Bill Woelfel', district: 5, party: 'democrat' },
  { name: 'Eric Nelson', district: 2, party: 'republican' },
  { name: 'Laura Chapman', district: 16, party: 'republican' },
  { name: 'Vince Deeds', district: 8, party: 'republican' },
]

const wvReps = [
  // Already seeded: Hanshaw, Summers, Capito, Steele, C.Phillips, Linville,
  // G.Foster, Ellington, J.Hardy, K.Young, Pushkin, E.Hansen, Fluharty,
  // Zukoff, Skaff
  // Missing delegates:
  { name: 'Riley Keaton', district: 6, party: 'republican' },
  { name: 'Marty Gearheart', district: 27, party: 'republican' },
  { name: 'Carl Martin', district: 44, party: 'republican' },
  { name: 'Dave Pethtel', district: 5, party: 'democrat' },
  { name: 'Dean Jeffries', district: 30, party: 'republican' },
  { name: 'Dianna Graves', district: 17, party: 'republican' },
  { name: 'Doug Smith', district: 24, party: 'republican' },
  { name: 'Elliott Pritt', district: 36, party: 'republican' },
  { name: 'Eric Brooks', district: 25, party: 'republican' },
  { name: 'Eric Householder', district: 64, party: 'republican' },
  { name: 'Gary Howell', district: 56, party: 'republican' },
  { name: 'Guy Ward', district: 42, party: 'republican' },
  { name: 'Heather Tully', district: 30, party: 'republican' },
  { name: 'Jeff Campbell', district: 47, party: 'republican' },
  { name: 'Jeff Pack', district: 43, party: 'republican' },
  { name: 'Jim Barach', district: 3, party: 'democrat' },
  { name: 'Jim Butler', district: 14, party: 'republican' },
  { name: 'John Paul Hott', district: 52, party: 'republican' },
  { name: 'John Williams', district: 48, party: 'republican' },
  { name: 'Jordan Bridges', district: 39, party: 'republican' },
  { name: 'Josh Holstein', district: 23, party: 'republican' },
  { name: 'Laura Kimble', district: 48, party: 'republican' },
  { name: 'Mark Dean', district: 52, party: 'republican' },
  { name: 'Mark Ross', district: 45, party: 'republican' },
  { name: 'Mark Zatezalo', district: 1, party: 'republican' },
  { name: 'Marvin Buck Jennings', district: 13, party: 'republican' },
  { name: 'Matt Rohrbach', district: 17, party: 'republican' },
  { name: 'Mike Hanna', district: 44, party: 'republican' },
  { name: 'Mike Honaker', district: 28, party: 'republican' },
  { name: 'Mike DeVault', district: 42, party: 'republican' },
  { name: 'Pat McGeehan', district: 1, party: 'republican' },
  { name: 'Phil Mallow', district: 46, party: 'republican' },
  { name: 'Randy Barach', district: 4, party: 'democrat' },
  { name: 'Ray Hinkle', district: 20, party: 'republican' },
  { name: 'Scott Brewer', district: 38, party: 'republican' },
  { name: 'Steve Westfall', district: 12, party: 'republican' },
  { name: 'Tom Bibby', district: 55, party: 'republican' },
  { name: 'Tom Fast', district: 32, party: 'republican' },
  { name: 'Vernon Criss', district: 7, party: 'republican' },
  { name: 'Caleb Hanna', district: 44, party: 'republican' },
  { name: 'Clay Riley', district: 41, party: 'republican' },
  { name: 'Don Forsht', district: 18, party: 'republican' },
  { name: 'Adam Burkhammer', district: 50, party: 'republican' },
  { name: 'April Piso', district: 40, party: 'republican' },
  { name: 'BJ Adkins', district: 17, party: 'republican' },
  { name: 'Blake Leggett', district: 46, party: 'republican' },
  { name: 'Carl Martin', district: 44, party: 'republican' },
  { name: 'Chris Toney', district: 29, party: 'republican' },
  { name: 'Cindy Frich', district: 16, party: 'republican' },
  { name: 'David Kelly', district: 11, party: 'republican' },
  { name: 'Daryl Cowles', district: 58, party: 'republican' },
  { name: 'Eric King', district: 37, party: 'democrat' },
  { name: 'Joe Jeffries', district: 36, party: 'republican' },
  { name: 'Jonathan Pinson', district: 22, party: 'republican' },
  { name: 'Keith Marple', district: 10, party: 'republican' },
  { name: 'Laura Sparks', district: 39, party: 'republican' },
  { name: 'Mark Sorsaia', district: 25, party: 'republican' },
  { name: 'Marty Mayfield', district: 57, party: 'republican' },
  { name: 'Michael Hornbuckle', district: 34, party: 'democrat' },
  { name: 'Ricky Moye', district: 9, party: 'democrat' },
  { name: 'Ron Walters', district: 2, party: 'republican' },
  { name: 'Sean Hornbuckle', district: 34, party: 'democrat' },
  { name: 'Todd Kirby', district: 53, party: 'republican' },
  { name: 'Todd Longanacre', district: 43, party: 'republican' },
  { name: 'Ty Nestor', district: 31, party: 'republican' },
  { name: 'Walter Hall', district: 22, party: 'democrat' },
  { name: 'Wayne Clark', district: 54, party: 'republican' },
  { name: 'William Shamblin', district: 20, party: 'republican' },
  { name: 'Evan Hansen', district: 51, party: 'democrat' },
  { name: 'Heath Ritchie', district: 49, party: 'republican' },
  { name: 'Joey Garcia', district: 36, party: 'democrat' },
  { name: 'Laura Kimble', district: 48, party: 'republican' },
  { name: 'Lucas Martin', district: 8, party: 'republican' },
  { name: 'Nathan Brown', district: 21, party: 'republican' },
  { name: 'Patrick Morrisey', district: 41, party: 'republican' },
  { name: 'Philip Diserio', district: 2, party: 'democrat' },
  { name: 'Phillip Diserio', district: 3, party: 'democrat' },
  { name: 'Rick Thompson', district: 26, party: 'democrat' },
  { name: 'Rodney Pyles', district: 55, party: 'republican' },
  { name: 'Samuel Calhoun', district: 29, party: 'republican' },
  { name: 'Steve Westfall', district: 12, party: 'republican' },
  { name: 'Tucker Haymond', district: 8, party: 'republican' },
  { name: 'Brandon Steele', district: 29, party: 'republican' },
  { name: 'Mark Sorsaia', district: 25, party: 'republican' },
  { name: 'Syd Clements', district: 32, party: 'republican' },
]

// ════════════════════════════════════════════════════════════════
// WYOMING — 31 senate seats, 62 house seats
// ════════════════════════════════════════════════════════════════

const wySenators = [
  // Already seeded: Driskill, Hicks, Biteman, Boner, Steinmetz, Rothfuss,
  // Case, Dockstader, Kinskey, Perkins, Cooper, Barlow, Baldwin, Wasserburger,
  // J.Anderson, Kolb, Hutchings, Gierau, Kost, Pappas, T.French, Salazar,
  // McKeown, Schuler
  // Missing senators:
  { name: 'Affie Ellis', district: 8, party: 'republican' },
  { name: 'Bill Landen', district: 26, party: 'republican' },
  { name: 'Charles Scott', district: 13, party: 'republican' },
  { name: 'Dan Furphy', district: 10, party: 'republican' },
  { name: 'Dave Kinskey', district: 22, party: 'republican' },
  { name: 'Tom James', district: 23, party: 'republican' },
  { name: 'Tara Nethercott', district: 7, party: 'republican' },
]

const wyReps = [
  // Already seeded: Sommers, Neiman, Crago, Henderson, Nicholas, Stith,
  // Oakley, Hunt, Olsen, Haroldson, Bear, Eklund, L.Brown, L.Larsen,
  // Jennings, Lawley, Yin, Provenza, Sherwood, Storer, Pendergraft,
  // Rodriguez-Williams, Heiner, Locke
  // Missing house members:
  { name: 'Clarence Styvar', district: 47, party: 'republican' },
  { name: 'Cody Wylie', district: 26, party: 'republican' },
  { name: 'Dan Kirkbride', district: 4, party: 'republican' },
  { name: 'Danny Eyre', district: 13, party: 'republican' },
  { name: 'David Northrup', district: 57, party: 'republican' },
  { name: 'Donald Burkhart', district: 15, party: 'republican' },
  { name: 'Ember Oakley', district: 27, party: 'republican' },
  { name: 'Evan Simpson', district: 62, party: 'republican' },
  { name: 'Grey Bull', district: 33, party: 'democrat' },
  { name: 'Jacob Wasserburger', district: 17, party: 'republican' },
  { name: 'Jamie Flitner', district: 55, party: 'republican' },
  { name: 'Jerry Obermueller', district: 56, party: 'republican' },
  { name: 'John Romero-Martinez', district: 60, party: 'republican' },
  { name: 'John Winter', district: 28, party: 'republican' },
  { name: 'Ken Chestek', district: 49, party: 'democrat' },
  { name: 'Larry Hicks', district: 11, party: 'republican' },
  { name: 'Liz Storer', district: 42, party: 'democrat' },
  { name: 'Mark Baker', district: 58, party: 'republican' },
  { name: 'Mark Kinner', district: 37, party: 'republican' },
  { name: 'Marshall Burt', district: 39, party: 'republican' },
  { name: 'Mike Yin', district: 16, party: 'democrat' },
  { name: 'Nate Winters', district: 22, party: 'republican' },
  { name: 'Ocean Andrew', district: 46, party: 'republican' },
  { name: 'Pat Sweeney', district: 44, party: 'republican' },
  { name: 'Rachel Rodriguez-Williams', district: 52, party: 'republican' },
  { name: 'Reuben Tarver', district: 14, party: 'republican' },
  { name: 'Robert Davis', district: 21, party: 'republican' },
  { name: 'Sara Burlingame', district: 45, party: 'democrat' },
  { name: 'Scott Clem', district: 31, party: 'republican' },
  { name: 'Steve Harshman', district: 37, party: 'republican' },
  { name: 'Sue Wilson', district: 7, party: 'republican' },
  { name: 'Tim Hallinan', district: 19, party: 'republican' },
  { name: 'Tomi Strock', district: 5, party: 'republican' },
  { name: 'Tony Locke', district: 38, party: 'republican' },
  { name: 'Trey Sherwood', district: 43, party: 'democrat' },
  { name: 'Wyatt Agar', district: 32, party: 'republican' },
  { name: 'Cyrus Western', district: 51, party: 'republican' },
  { name: 'Bill Allemand', district: 61, party: 'republican' },
]

// ─── Build rows and upsert ───────────────────────────────────────────
function buildRows(members, state, chamber, titlePrefix) {
  return members.map(m => ({
    name: m.name,
    slug: slugify(m.name),
    state,
    chamber,
    party: m.party,
    title: `${titlePrefix}, District ${m.district}`,
    bio: `${m.name} is a ${m.party === 'democrat' ? 'Democratic' : m.party === 'republican' ? 'Republican' : 'Independent'} member of the ${state} state legislature.`,
    image_url: null,
  }))
}

async function getExistingSlugs(state) {
  const slugs = new Set()
  let from = 0
  const PAGE = 1000
  while (true) {
    const { data, error } = await supabase
      .from('politicians')
      .select('slug')
      .eq('state', state)
      .range(from, from + PAGE - 1)
    if (error) { console.error(`Error fetching ${state}:`, error.message); break }
    for (const row of data) slugs.add(row.slug)
    if (data.length < PAGE) break
    from += PAGE
  }
  return slugs
}

async function upsertNew(rows, existingSlugs) {
  // Dedupe by slug, skip already existing
  const seen = new Set()
  const newRows = rows.filter(r => {
    if (seen.has(r.slug) || existingSlugs.has(r.slug)) return false
    seen.add(r.slug)
    return true
  })
  let inserted = 0
  for (let i = 0; i < newRows.length; i += 50) {
    const batch = newRows.slice(i, i + 50)
    const { error } = await supabase.from('politicians').upsert(batch, { onConflict: 'slug' })
    if (error) console.error(`  Error batch ${i}:`, error.message)
    else {
      console.log(`  Upserted ${batch.length} rows (batch ${Math.floor(i / 50) + 1})`)
      inserted += batch.length
    }
  }
  return inserted
}

async function main() {
  const totals = {}

  console.log('\n=== Montana ===')
  const mtExisting = await getExistingSlugs('MT')
  console.log(`  Existing MT politicians: ${mtExisting.size}`)
  const mtRows = [
    ...buildRows(mtSenators, 'MT', 'state_senate', 'MT State Senator'),
    ...buildRows(mtReps, 'MT', 'state_house', 'MT State Representative'),
  ]
  totals.MT = await upsertNew(mtRows, mtExisting)
  console.log(`  New MT inserted: ${totals.MT}`)

  console.log('\n=== North Dakota ===')
  const ndExisting = await getExistingSlugs('ND')
  console.log(`  Existing ND politicians: ${ndExisting.size}`)
  const ndRows = [
    ...buildRows(ndSenators, 'ND', 'state_senate', 'ND State Senator'),
    ...buildRows(ndReps, 'ND', 'state_house', 'ND State Representative'),
  ]
  totals.ND = await upsertNew(ndRows, ndExisting)
  console.log(`  New ND inserted: ${totals.ND}`)

  console.log('\n=== South Dakota ===')
  const sdExisting = await getExistingSlugs('SD')
  console.log(`  Existing SD politicians: ${sdExisting.size}`)
  const sdRows = [
    ...buildRows(sdSenators, 'SD', 'state_senate', 'SD State Senator'),
    ...buildRows(sdReps, 'SD', 'state_house', 'SD State Representative'),
  ]
  totals.SD = await upsertNew(sdRows, sdExisting)
  console.log(`  New SD inserted: ${totals.SD}`)

  console.log('\n=== West Virginia ===')
  const wvExisting = await getExistingSlugs('WV')
  console.log(`  Existing WV politicians: ${wvExisting.size}`)
  const wvRows = [
    ...buildRows(wvSenators, 'WV', 'state_senate', 'WV State Senator'),
    ...buildRows(wvReps, 'WV', 'state_house', 'WV State Delegate'),
  ]
  totals.WV = await upsertNew(wvRows, wvExisting)
  console.log(`  New WV inserted: ${totals.WV}`)

  console.log('\n=== Wyoming ===')
  const wyExisting = await getExistingSlugs('WY')
  console.log(`  Existing WY politicians: ${wyExisting.size}`)
  const wyRows = [
    ...buildRows(wySenators, 'WY', 'state_senate', 'WY State Senator'),
    ...buildRows(wyReps, 'WY', 'state_house', 'WY State Representative'),
  ]
  totals.WY = await upsertNew(wyRows, wyExisting)
  console.log(`  New WY inserted: ${totals.WY}`)

  console.log('\n=== SUMMARY ===')
  for (const [state, count] of Object.entries(totals)) {
    console.log(`  ${state}: ${count} new legislators inserted`)
  }
  console.log(`  Total: ${Object.values(totals).reduce((a, b) => a + b, 0)} new legislators`)
  console.log('Done!')
}

main().catch(console.error)
