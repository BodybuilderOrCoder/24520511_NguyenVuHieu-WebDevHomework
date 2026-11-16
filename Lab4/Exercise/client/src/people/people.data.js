/** @typedef {{ id: string, name: string, role: string, field: string, born: number, bio: string }} Person */

/** @type {Person[]} */
export const people = [
  {
    id: '1',
    name: 'Ada Lovelace',
    role: 'Mathematician',
    field: 'Analytical Engine programming',
    born: 1815,
    bio: 'Wrote the first published algorithm intended for a machine.',
  },
  {
    id: '2',
    name: 'Alan Turing',
    role: 'Computer Scientist',
    field: 'Computability and cryptanalysis',
    born: 1912,
    bio: 'Formalised computation with the Turing machine and helped break Enigma.',
  },
  {
    id: '3',
    name: 'Grace Hopper',
    role: 'Rear Admiral',
    field: 'Compilers',
    born: 1906,
    bio: 'Built one of the first compilers and championed machine-independent languages.',
  },
  {
    id: '4',
    name: 'Katherine Johnson',
    role: 'NASA Mathematician',
    field: 'Orbital mechanics',
    born: 1918,
    bio: 'Calculated trajectories for the Mercury and Apollo missions.',
  },
  {
    id: '5',
    name: 'Margaret Hamilton',
    role: 'Software Engineer',
    field: 'Flight software',
    born: 1936,
    bio: 'Led the Apollo on-board flight software team at MIT.',
  },
];
