// Seed script: Idaho, Nevada, New Mexico, Utah state legislators
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
// IDAHO — 35 senate seats, 70 house seats
// ════════════════════════════════════════════════════════════════

const idHouse = [
  { name: 'Mark Sauter', district: 1, party: 'republican' },
  { name: 'Cornel Rasor', district: 1, party: 'republican' },
  { name: 'Heather Scott', district: 2, party: 'republican' },
  { name: 'Dale Hawkins', district: 2, party: 'republican' },
  { name: 'Vito Barbieri', district: 3, party: 'republican' },
  { name: 'Jordan Redman', district: 3, party: 'republican' },
  { name: 'Joe Alfieri', district: 4, party: 'republican' },
  { name: 'Elaine Price', district: 4, party: 'republican' },
  { name: 'Ron Mendive', district: 5, party: 'republican' },
  { name: 'Tony Wisniewski', district: 5, party: 'republican' },
  { name: 'Lori McCann', district: 6, party: 'republican' },
  { name: 'Brandon Mitchell', district: 6, party: 'republican' },
  { name: 'Kyle Harris', district: 7, party: 'republican' },
  { name: 'Charlie Shepherd', district: 7, party: 'republican' },
  { name: 'Rob Beiswenger', district: 8, party: 'republican' },
  { name: 'Faye Thompson', district: 8, party: 'republican' },
  { name: 'John Shirts', district: 9, party: 'republican' },
  { name: 'Judy Boyle', district: 9, party: 'republican' },
  { name: 'Mike Moyle', district: 10, party: 'republican' },
  { name: 'Bruce Skaug', district: 10, party: 'republican' },
  { name: 'Kent Marmon', district: 11, party: 'republican' },
  { name: 'Lucas Cayler', district: 11, party: 'republican' },
  { name: 'Jeff Cornilles', district: 12, party: 'republican' },
  { name: 'Jaron Crane', district: 12, party: 'republican' },
  { name: 'Brent Crane', district: 13, party: 'republican' },
  { name: 'Steve Tanner', district: 13, party: 'republican' },
  { name: 'Ted Hill', district: 14, party: 'republican' },
  { name: 'Josh Tanner', district: 14, party: 'republican' },
  { name: 'Steve Berch', district: 15, party: 'democrat' },
  { name: 'Dori Healey', district: 15, party: 'republican' },
  { name: 'Sonia Galaviz', district: 16, party: 'democrat' },
  { name: 'Annie Haws', district: 16, party: 'democrat' },
  { name: 'John L. Gannon', district: 17, party: 'democrat' },
  { name: 'Megan Egbert', district: 17, party: 'democrat' },
  { name: 'Ilana Rubel', district: 18, party: 'democrat' },
  { name: 'Brooke Green', district: 18, party: 'democrat' },
  { name: 'Monica Church', district: 19, party: 'democrat' },
  { name: 'Chris Mathias', district: 19, party: 'democrat' },
  { name: 'Joe Palmer', district: 20, party: 'republican' },
  { name: 'James Holtzclaw', district: 20, party: 'republican' },
  { name: 'James Petzke', district: 21, party: 'republican' },
  { name: 'Jeff Ehlers', district: 21, party: 'republican' },
  { name: 'John Vander Woude', district: 22, party: 'republican' },
  { name: 'Jason Monks', district: 22, party: 'republican' },
  { name: 'Chris Bruce', district: 23, party: 'republican' },
  { name: 'Shawn Dygert', district: 23, party: 'republican' },
  { name: 'Clint Hostetler', district: 24, party: 'republican' },
  { name: 'Steve Miller', district: 24, party: 'republican' },
  { name: 'Donald Hall', district: 25, party: 'republican' },
  { name: 'David Leavitt', district: 25, party: 'republican' },
  { name: 'Mike Pohanka', district: 26, party: 'republican' },
  { name: 'Jack Nelsen', district: 26, party: 'republican' },
  { name: 'Douglas T. Pickett', district: 27, party: 'republican' },
  { name: 'Clay Handy', district: 27, party: 'republican' },
  { name: 'Richard Cheatum', district: 28, party: 'republican' },
  { name: 'Dan Garner', district: 28, party: 'republican' },
  { name: 'Dustin W. Manwaring', district: 29, party: 'republican' },
  { name: 'Tanya Burgoyne', district: 29, party: 'republican' },
  { name: 'David Cannon', district: 30, party: 'republican' },
  { name: 'Ben Fuhriman', district: 30, party: 'republican' },
  { name: 'Jerald Raymond', district: 31, party: 'republican' },
  { name: 'Rod Furniss', district: 31, party: 'republican' },
  { name: 'Stephanie Mickelsen', district: 32, party: 'republican' },
  { name: 'Erin Bingham', district: 32, party: 'republican' },
  { name: 'Barbara Ehardt', district: 33, party: 'republican' },
  { name: 'Marco Erickson', district: 33, party: 'republican' },
  { name: 'Jon Weber', district: 34, party: 'republican' },
  { name: 'Britt Raybould', district: 34, party: 'republican' },
  { name: 'Mike Veile', district: 35, party: 'republican' },
  { name: 'Josh Wheeler', district: 35, party: 'republican' },
]

const idSenate = [
  { name: 'Jim Woodward', district: 1, party: 'republican' },
  { name: 'Phil Hart', district: 2, party: 'republican' },
  { name: 'Doug Okuniewicz', district: 3, party: 'republican' },
  { name: 'Ben Toews', district: 4, party: 'republican' },
  { name: 'Carl Bjerke', district: 5, party: 'republican' },
  { name: 'Dan Foreman', district: 6, party: 'republican' },
  { name: 'Cindy Carlson', district: 7, party: 'republican' },
  { name: 'Christy Zito', district: 8, party: 'republican' },
  { name: 'Brandon Shippy', district: 9, party: 'republican' },
  { name: 'Tammy Nichols', district: 10, party: 'republican' },
  { name: 'Camille Blaylock', district: 11, party: 'republican' },
  { name: 'Ben Adams', district: 12, party: 'republican' },
  { name: 'Brian Lenney', district: 13, party: 'republican' },
  { name: 'C. Scott Grow', district: 14, party: 'republican' },
  { name: 'Codi Galloway', district: 15, party: 'republican' },
  { name: 'Alison Rabe', district: 16, party: 'democrat' },
  { name: 'Carrie Semmelroth', district: 17, party: 'democrat' },
  { name: 'Janie Ward-Engelking', district: 18, party: 'democrat' },
  { name: 'Melissa Wintrow', district: 19, party: 'democrat' },
  { name: 'Josh Keyser', district: 20, party: 'republican' },
  { name: 'Treg Bernt', district: 21, party: 'republican' },
  { name: 'Lori Den Hartog', district: 22, party: 'republican' },
  { name: 'Todd Lakey', district: 23, party: 'republican' },
  { name: 'Glenneda Zuiderveld', district: 24, party: 'republican' },
  { name: 'Josh Kohl', district: 25, party: 'republican' },
  { name: 'Ron Taylor', district: 26, party: 'democrat' },
  { name: 'Kelly Anthon', district: 27, party: 'republican' },
  { name: 'Jim Guthrie', district: 28, party: 'republican' },
  { name: 'James Ruchti', district: 29, party: 'democrat' },
  { name: 'Julie VanOrden', district: 30, party: 'republican' },
  { name: 'Van Burtenshaw', district: 31, party: 'republican' },
  { name: 'Kevin Cook', district: 32, party: 'republican' },
  { name: 'David Lent', district: 33, party: 'republican' },
  { name: 'Doug Ricks', district: 34, party: 'republican' },
  { name: 'Mark Harris', district: 35, party: 'republican' },
]

// ════════════════════════════════════════════════════════════════
// NEVADA — 21 senate seats, 42 assembly seats (assembly = state_house)
// ════════════════════════════════════════════════════════════════

const nvAssembly = [
  { name: 'Daniele Monroe-Moreno', district: 1, party: 'democrat' },
  { name: 'Heidi Kasama', district: 2, party: 'republican' },
  { name: 'Selena Torres', district: 3, party: 'democrat' },
  { name: 'Lisa Cole', district: 4, party: 'republican' },
  { name: 'Brittney Miller', district: 5, party: 'democrat' },
  { name: 'Jovan Jackson', district: 6, party: 'democrat' },
  { name: 'Tanya Flanagan', district: 7, party: 'democrat' },
  { name: 'Duy Nguyen', district: 8, party: 'democrat' },
  { name: 'Steve Yeager', district: 9, party: 'democrat' },
  { name: 'Venise Karris', district: 10, party: 'democrat' },
  { name: 'Cinthia Moore', district: 11, party: 'democrat' },
  { name: 'Max Carter II', district: 12, party: 'democrat' },
  { name: 'Brian Hibbetts', district: 13, party: 'republican' },
  { name: 'Erica Mosca', district: 14, party: 'democrat' },
  { name: 'Howard Watts III', district: 15, party: 'democrat' },
  { name: 'Cecelia Gonzalez', district: 16, party: 'democrat' },
  { name: 'Linda Hunt', district: 17, party: 'democrat' },
  { name: 'Venicia Considine', district: 18, party: 'democrat' },
  { name: 'Jason Patchett', district: 19, party: 'republican' },
  { name: 'David Orentlicher', district: 20, party: 'democrat' },
  { name: 'Elaine Marzola', district: 21, party: 'democrat' },
  { name: 'Melissa Hardy', district: 22, party: 'republican' },
  { name: 'Danielle Gallant', district: 23, party: 'republican' },
  { name: 'Erica Roth', district: 24, party: 'democrat' },
  { name: 'Selena La Rue Hatch', district: 25, party: 'democrat' },
  { name: 'Rich DeLong', district: 26, party: 'republican' },
  { name: 'Heather Goulding', district: 27, party: 'democrat' },
  { name: 'Reuben DSilva', district: 28, party: 'democrat' },
  { name: 'Joe Dalia', district: 29, party: 'democrat' },
  { name: 'Natha Anderson', district: 30, party: 'democrat' },
  { name: 'Jill Dickman', district: 31, party: 'republican' },
  { name: 'Alexis Hansen', district: 32, party: 'republican' },
  { name: 'Bert Gurr', district: 33, party: 'republican' },
  { name: 'Hanadi Nadeem', district: 34, party: 'democrat' },
  { name: 'Rebecca Edgeworth', district: 35, party: 'republican' },
  { name: 'Gregory Hafen', district: 36, party: 'republican' },
  { name: 'Shea Backus', district: 37, party: 'democrat' },
  { name: 'Gregory Koenig', district: 38, party: 'republican' },
  { name: 'Ken Gray', district: 39, party: 'republican' },
  { name: 'Philip ONeill', district: 40, party: 'republican' },
  { name: 'Sandra Jauregui', district: 41, party: 'democrat' },
  { name: 'Tracy Brown-May', district: 42, party: 'democrat' },
]

const nvSenate = [
  { name: 'Michelee Crawford', district: 1, party: 'democrat' },
  { name: 'Edgar Flores', district: 2, party: 'democrat' },
  { name: 'Rochelle Nguyen', district: 3, party: 'democrat' },
  { name: 'Dina Neal', district: 4, party: 'democrat' },
  { name: 'Carrie Buck', district: 5, party: 'republican' },
  { name: 'Nicole Cannizzaro', district: 6, party: 'democrat' },
  { name: 'Roberta Lange', district: 7, party: 'democrat' },
  { name: 'Marilyn Dondero Loop', district: 8, party: 'democrat' },
  { name: 'Melanie Scheible', district: 9, party: 'democrat' },
  { name: 'Fabian Donate', district: 10, party: 'democrat' },
  { name: 'Lori Rogich', district: 11, party: 'republican' },
  { name: 'Julie Pazina', district: 12, party: 'democrat' },
  { name: 'Skip Daly', district: 13, party: 'democrat' },
  { name: 'Ira Hansen', district: 14, party: 'republican' },
  { name: 'Angie Taylor', district: 15, party: 'democrat' },
  { name: 'Lisa Krasner', district: 16, party: 'republican' },
  { name: 'Robin Titus', district: 17, party: 'republican' },
  { name: 'John Steinbeck', district: 18, party: 'republican' },
  { name: 'John Ellison', district: 19, party: 'republican' },
  { name: 'Jeff Stone', district: 20, party: 'republican' },
  { name: 'James Ohrenschall', district: 21, party: 'democrat' },
]

// ════════════════════════════════════════════════════════════════
// NEW MEXICO — 42 senate seats, 70 house seats
// ════════════════════════════════════════════════════════════════

const nmHouse = [
  { name: 'Rodney Montoya', district: 1, party: 'republican' },
  { name: 'P. Mark Duncan', district: 2, party: 'republican' },
  { name: 'Bill Hall', district: 3, party: 'republican' },
  { name: 'Joseph Hernandez', district: 4, party: 'democrat' },
  { name: 'Doreen Wonda Johnson', district: 5, party: 'democrat' },
  { name: 'Martha Garcia', district: 6, party: 'democrat' },
  { name: 'Tanya Mirabal Moya', district: 7, party: 'republican' },
  { name: 'Brian Baca', district: 8, party: 'republican' },
  { name: 'Patricia Lundstrom', district: 9, party: 'democrat' },
  { name: 'G. Andres Romero', district: 10, party: 'democrat' },
  { name: 'Javier Martinez', district: 11, party: 'democrat' },
  { name: 'Art De La Cruz', district: 12, party: 'democrat' },
  { name: 'Patricia Roybal Caballero', district: 13, party: 'democrat' },
  { name: 'Miguel Garcia', district: 14, party: 'democrat' },
  { name: 'Dayan Hochman-Vigil', district: 15, party: 'democrat' },
  { name: 'Yanira Gurrola Valenzuela', district: 16, party: 'democrat' },
  { name: 'Cynthia Borrego', district: 17, party: 'democrat' },
  { name: 'Marianna Anaya', district: 18, party: 'democrat' },
  { name: 'Janelle Anyanonu', district: 19, party: 'democrat' },
  { name: 'Meredith Dixon', district: 20, party: 'democrat' },
  { name: 'Debra Sarinana', district: 21, party: 'democrat' },
  { name: 'Stefani Lord', district: 22, party: 'republican' },
  { name: 'Alan Martinez', district: 23, party: 'republican' },
  { name: 'Elizabeth Thomson', district: 24, party: 'democrat' },
  { name: 'Cristina Parajon', district: 25, party: 'democrat' },
  { name: 'Eleanor Chavez', district: 26, party: 'democrat' },
  { name: 'Marian Matthews', district: 27, party: 'democrat' },
  { name: 'Pamelya Herndon', district: 28, party: 'democrat' },
  { name: 'Joy Garratt', district: 29, party: 'democrat' },
  { name: 'Elizabeth Torres-Velasquez', district: 30, party: 'democrat' },
  { name: 'Nicole Chavez', district: 31, party: 'republican' },
  { name: 'Jenifer Jones', district: 32, party: 'republican' },
  { name: 'Micaela Lara Cadena', district: 33, party: 'democrat' },
  { name: 'Raymundo Lara', district: 34, party: 'democrat' },
  { name: 'Angelica Rubio', district: 35, party: 'democrat' },
  { name: 'Nathan Small', district: 36, party: 'democrat' },
  { name: 'Joanne Ferrary', district: 37, party: 'democrat' },
  { name: 'Rebecca Dow', district: 38, party: 'republican' },
  { name: 'Luis Terrazas', district: 39, party: 'republican' },
  { name: 'Joseph Sanchez', district: 40, party: 'democrat' },
  { name: 'Susan Herrera', district: 41, party: 'democrat' },
  { name: 'Kristina Ortez', district: 42, party: 'democrat' },
  { name: 'Christine Chandler', district: 43, party: 'democrat' },
  { name: 'Kathleen Cates', district: 44, party: 'democrat' },
  { name: 'Linda Serrato', district: 45, party: 'democrat' },
  { name: 'Andrea Romero', district: 46, party: 'democrat' },
  { name: 'Reena Szczepanski', district: 47, party: 'democrat' },
  { name: 'Tara Lujan', district: 48, party: 'democrat' },
  { name: 'Gail Armstrong', district: 49, party: 'republican' },
  { name: 'Matthew McQueen', district: 50, party: 'democrat' },
  { name: 'John Block', district: 51, party: 'republican' },
  { name: 'Doreen Y. Gallegos', district: 52, party: 'democrat' },
  { name: 'Sarah Silva', district: 53, party: 'democrat' },
  { name: 'Jonathan Henry', district: 54, party: 'republican' },
  { name: 'Cathrynn Brown', district: 55, party: 'republican' },
  { name: 'Harlan Vincent', district: 56, party: 'republican' },
  { name: 'Catherine Cullen', district: 57, party: 'republican' },
  { name: 'Angelita Mejia', district: 58, party: 'republican' },
  { name: 'Mark Murphy', district: 59, party: 'republican' },
  { name: 'Joshua Hernandez', district: 60, party: 'republican' },
  { name: 'Randall Pettigrew', district: 61, party: 'republican' },
  { name: 'Elaine Sena Cortez', district: 62, party: 'republican' },
  { name: 'Martin Ruben Zamora', district: 63, party: 'republican' },
  { name: 'Andrea Reeb', district: 64, party: 'republican' },
  { name: 'Derrick Lente', district: 65, party: 'democrat' },
  { name: 'Jimmy Mason', district: 66, party: 'republican' },
  { name: 'Jack Chatfield', district: 67, party: 'republican' },
  { name: 'Charlotte Little', district: 68, party: 'democrat' },
  { name: 'Michelle Abeyta', district: 69, party: 'democrat' },
  { name: 'Anita Gonzales', district: 70, party: 'democrat' },
]

const nmSenate = [
  { name: 'William Sharer', district: 1, party: 'republican' },
  { name: 'Steve D. Lanier', district: 2, party: 'republican' },
  { name: 'Shannon Pinto', district: 3, party: 'democrat' },
  { name: 'George Munoz', district: 4, party: 'democrat' },
  { name: 'Leo Jaramillo', district: 5, party: 'democrat' },
  { name: 'Roberto Gonzales', district: 6, party: 'democrat' },
  { name: 'Pat Woods', district: 7, party: 'republican' },
  { name: 'Pete Campos', district: 8, party: 'democrat' },
  { name: 'Cindy Nava', district: 9, party: 'democrat' },
  { name: 'Katy Duhigg', district: 10, party: 'democrat' },
  { name: 'Linda Lopez', district: 11, party: 'democrat' },
  { name: 'Jay Block', district: 12, party: 'republican' },
  { name: 'Debbie OMalley', district: 13, party: 'democrat' },
  { name: 'Michael Padilla', district: 14, party: 'democrat' },
  { name: 'Heather Berghmans', district: 15, party: 'democrat' },
  { name: 'Antoinette Sedillo Lopez', district: 16, party: 'democrat' },
  { name: 'Mimi Stewart', district: 17, party: 'democrat' },
  { name: 'Natalie Figueroa', district: 18, party: 'democrat' },
  { name: 'Anthony Thornton', district: 19, party: 'republican' },
  { name: 'Martin Hickey', district: 20, party: 'democrat' },
  { name: 'Nicole L. Tobiassen', district: 21, party: 'republican' },
  { name: 'Benny Shendo', district: 22, party: 'democrat' },
  { name: 'Harold Pope Jr.', district: 23, party: 'democrat' },
  { name: 'Linda M. Trujillo', district: 24, party: 'democrat' },
  { name: 'Peter Wirth', district: 25, party: 'democrat' },
  { name: 'Antonio Maestas', district: 26, party: 'democrat' },
  { name: 'Patrick Boone IV', district: 27, party: 'republican' },
  { name: 'Gabriel J. Ramos', district: 28, party: 'republican' },
  { name: 'Joshua A. Sanchez', district: 29, party: 'republican' },
  { name: 'Angel Charley', district: 30, party: 'democrat' },
  { name: 'Joseph Cervantes', district: 31, party: 'democrat' },
  { name: 'Candy Spence Ezzell', district: 32, party: 'republican' },
  { name: 'Rex Wilson', district: 33, party: 'republican' },
  { name: 'James G. Townsend', district: 34, party: 'republican' },
  { name: 'Crystal Diamond Brantley', district: 35, party: 'republican' },
  { name: 'Jeff Steinborn', district: 36, party: 'democrat' },
  { name: 'William P. Soules', district: 37, party: 'democrat' },
  { name: 'Carrie Hamblen', district: 38, party: 'democrat' },
  { name: 'Liz Stefanics', district: 39, party: 'democrat' },
  { name: 'Craig W. Brandt', district: 40, party: 'republican' },
  { name: 'David M. Gallegos', district: 41, party: 'republican' },
  { name: 'Larry R. Scott', district: 42, party: 'republican' },
]

// ════════════════════════════════════════════════════════════════
// UTAH — 29 senate seats, 75 house seats (D6 and D60 vacant, skip)
// ════════════════════════════════════════════════════════════════

const utHouse = [
  { name: 'Thomas Peterson', district: 1, party: 'republican' },
  { name: 'Mike Petersen', district: 2, party: 'republican' },
  { name: 'Jason Thompson', district: 3, party: 'republican' },
  { name: 'Tiara Auxier', district: 4, party: 'republican' },
  { name: 'Casey Snider', district: 5, party: 'republican' },
  // D6 Vacant — skipped
  { name: 'Ryan Wilcox', district: 7, party: 'republican' },
  { name: 'Jason Kyle', district: 8, party: 'republican' },
  { name: 'Jake Sawyer', district: 9, party: 'republican' },
  { name: 'Jill Koford', district: 10, party: 'republican' },
  { name: 'Katy Hall', district: 11, party: 'republican' },
  { name: 'Mike Schultz', district: 12, party: 'republican' },
  { name: 'Karen Peterson', district: 13, party: 'republican' },
  { name: 'Karianne Lisonbee', district: 14, party: 'republican' },
  { name: 'Ariel Defay', district: 15, party: 'republican' },
  { name: 'Trevor Lee', district: 16, party: 'republican' },
  { name: 'Stewart Barlow', district: 17, party: 'republican' },
  { name: 'Paul Cutler', district: 18, party: 'republican' },
  { name: 'Raymond Ward', district: 19, party: 'republican' },
  { name: 'Melissa Ballard', district: 20, party: 'republican' },
  { name: 'Sandra Hollins', district: 21, party: 'democrat' },
  { name: 'Jen Dailey-Provost', district: 22, party: 'democrat' },
  { name: 'Hoang Nguyen', district: 23, party: 'democrat' },
  { name: 'Grant Amjad Miller', district: 24, party: 'democrat' },
  { name: 'Angela Romero', district: 25, party: 'democrat' },
  { name: 'Matt MacPherson', district: 26, party: 'republican' },
  { name: 'Anthony Loubet', district: 27, party: 'republican' },
  { name: 'Nicholeen Peck', district: 28, party: 'republican' },
  { name: 'Bridger Bolinder', district: 29, party: 'republican' },
  { name: 'Jake Fitisemanu', district: 30, party: 'democrat' },
  { name: 'Verona Mauga', district: 31, party: 'democrat' },
  { name: 'Sahara Hayes', district: 32, party: 'democrat' },
  { name: 'Doug Owens', district: 33, party: 'democrat' },
  { name: 'Carol Moss', district: 34, party: 'democrat' },
  { name: 'Rosalba Dominguez', district: 35, party: 'democrat' },
  { name: 'Jim Dunnigan', district: 36, party: 'republican' },
  { name: 'Ashlee Matthews', district: 37, party: 'democrat' },
  { name: 'Cheryl K. Acton', district: 38, party: 'republican' },
  { name: 'Ken Ivory', district: 39, party: 'republican' },
  { name: 'Andrew Stoddard', district: 40, party: 'democrat' },
  { name: 'John Arthur', district: 41, party: 'democrat' },
  { name: 'Clint Okerlund', district: 42, party: 'republican' },
  { name: 'Steven Eliason', district: 43, party: 'republican' },
  { name: 'Jordan Teuscher', district: 44, party: 'republican' },
  { name: 'Tracy Miller', district: 45, party: 'republican' },
  { name: 'Cal Roberts', district: 46, party: 'republican' },
  { name: 'Mark Strong', district: 47, party: 'republican' },
  { name: 'Doug Fiefia', district: 48, party: 'republican' },
  { name: 'Candice Pierucci', district: 49, party: 'republican' },
  { name: 'Stephanie Gricius', district: 50, party: 'republican' },
  { name: 'Leah Hansen', district: 51, party: 'republican' },
  { name: 'Cory Maloy', district: 52, party: 'republican' },
  { name: 'Kay Christofferson', district: 53, party: 'republican' },
  { name: 'Kristen Chevrier', district: 54, party: 'republican' },
  { name: 'Jon Hawkins', district: 55, party: 'republican' },
  { name: 'Val Peterson', district: 56, party: 'republican' },
  { name: 'Nelson Abbott', district: 57, party: 'republican' },
  { name: 'David Shallenberger', district: 58, party: 'republican' },
  { name: 'Mike Kohler', district: 59, party: 'republican' },
  // D60 Vacant — skipped
  { name: 'Lisa Shepherd', district: 61, party: 'republican' },
  { name: 'Norman Thurston', district: 62, party: 'republican' },
  { name: 'Stephen Whyte', district: 63, party: 'republican' },
  { name: 'Jefferson Burton', district: 64, party: 'republican' },
  { name: 'Doug Welton', district: 65, party: 'republican' },
  { name: 'Troy Shelley', district: 66, party: 'republican' },
  { name: 'Christine Watkins', district: 67, party: 'republican' },
  { name: 'Scott H. Chew', district: 68, party: 'republican' },
  { name: 'Logan Monson', district: 69, party: 'republican' },
  { name: 'Carl R. Albrecht', district: 70, party: 'republican' },
  { name: 'Rex Shipp', district: 71, party: 'republican' },
  { name: 'Joseph Elison', district: 72, party: 'republican' },
  { name: 'Colin Jack', district: 73, party: 'republican' },
  { name: 'Neil Walter', district: 74, party: 'republican' },
  { name: 'Walt Brooks', district: 75, party: 'republican' },
]

const utSenate = [
  { name: 'Scott Sandall', district: 1, party: 'republican' },
  { name: 'Chris Wilson', district: 2, party: 'republican' },
  { name: 'John Johnson', district: 3, party: 'republican' },
  { name: 'Calvin Musselman', district: 4, party: 'republican' },
  { name: 'Ann Millner', district: 5, party: 'republican' },
  { name: 'Jerry Stevenson', district: 6, party: 'republican' },
  { name: 'Stuart Adams', district: 7, party: 'republican' },
  { name: 'Todd Weiler', district: 8, party: 'republican' },
  { name: 'Jennifer Plumb', district: 9, party: 'democrat' },
  { name: 'Luz Escamilla', district: 10, party: 'democrat' },
  { name: 'Emily Buss', district: 11, party: 'independent' },
  { name: 'Karen Kwan', district: 12, party: 'democrat' },
  { name: 'Nate Blouin', district: 13, party: 'democrat' },
  { name: 'Stephanie Pitcher', district: 14, party: 'democrat' },
  { name: 'Kathleen Riebe', district: 15, party: 'democrat' },
  { name: 'Wayne Harper', district: 16, party: 'republican' },
  { name: 'Lincoln Fillmore', district: 17, party: 'republican' },
  { name: 'Dan McCay', district: 18, party: 'republican' },
  { name: 'Kirk Cullimore', district: 19, party: 'republican' },
  { name: 'Ronald Winterton', district: 20, party: 'republican' },
  { name: 'Brady Brammer', district: 21, party: 'republican' },
  { name: 'Heidi Balderree', district: 22, party: 'republican' },
  { name: 'Keith Grover', district: 23, party: 'republican' },
  { name: 'Keven Stratton', district: 24, party: 'republican' },
  { name: 'Mike McKell', district: 25, party: 'republican' },
  { name: 'David Hinkins', district: 26, party: 'republican' },
  { name: 'Derrin Owens', district: 27, party: 'republican' },
  { name: 'Evan Vickers', district: 28, party: 'republican' },
  { name: 'Don Ipson', district: 29, party: 'republican' },
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

  console.log('\n=== Idaho ===')
  const idExisting = await getExistingSlugs('ID')
  console.log(`  Existing ID politicians: ${idExisting.size}`)
  const idRows = [
    ...buildRows(idSenate, 'ID', 'state_senate', 'ID State Senator'),
    ...buildRows(idHouse, 'ID', 'state_house', 'ID State Representative'),
  ]
  totals.ID = await upsertNew(idRows, idExisting)
  console.log(`  New ID inserted: ${totals.ID}`)

  console.log('\n=== Nevada ===')
  const nvExisting = await getExistingSlugs('NV')
  console.log(`  Existing NV politicians: ${nvExisting.size}`)
  const nvRows = [
    ...buildRows(nvSenate, 'NV', 'state_senate', 'NV State Senator'),
    ...buildRows(nvAssembly, 'NV', 'state_house', 'NV Assembly Member'),
  ]
  totals.NV = await upsertNew(nvRows, nvExisting)
  console.log(`  New NV inserted: ${totals.NV}`)

  console.log('\n=== New Mexico ===')
  const nmExisting = await getExistingSlugs('NM')
  console.log(`  Existing NM politicians: ${nmExisting.size}`)
  const nmRows = [
    ...buildRows(nmSenate, 'NM', 'state_senate', 'NM State Senator'),
    ...buildRows(nmHouse, 'NM', 'state_house', 'NM State Representative'),
  ]
  totals.NM = await upsertNew(nmRows, nmExisting)
  console.log(`  New NM inserted: ${totals.NM}`)

  console.log('\n=== Utah ===')
  const utExisting = await getExistingSlugs('UT')
  console.log(`  Existing UT politicians: ${utExisting.size}`)
  const utRows = [
    ...buildRows(utSenate, 'UT', 'state_senate', 'UT State Senator'),
    ...buildRows(utHouse, 'UT', 'state_house', 'UT State Representative'),
  ]
  totals.UT = await upsertNew(utRows, utExisting)
  console.log(`  New UT inserted: ${totals.UT}`)

  console.log('\n=== SUMMARY ===')
  for (const [state, count] of Object.entries(totals)) {
    console.log(`  ${state}: ${count} new legislators inserted`)
  }
  console.log(`  Total: ${Object.values(totals).reduce((a, b) => a + b, 0)} new legislators`)
  console.log('Done!')
}

main().catch(console.error)
