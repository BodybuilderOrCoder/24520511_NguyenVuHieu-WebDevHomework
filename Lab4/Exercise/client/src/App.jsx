import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';
import Layout from './layouts/Layout.jsx';
import { About, Home, NotFound, PageShell, PeopleIndex } from './pages/Pages.jsx';
import PeopleLayout from './people/PeopleLayout.jsx';
import Skeleton from './people/Skeleton.jsx';
import { people } from './people/people.data.js';

// Ex 1.1 — PersonDetail ships in its own JS chunk, loaded on first visit to /people/:id.
const PersonDetail = lazy(() => import('./people/PersonDetail.jsx'));

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route
          path="people"
          element={
            <>
              <h1>People directory</h1>
              <PeopleLayout people={people} />
            </>
          }
        >
          <Route index element={<PeopleIndex />} />
          <Route
            path=":id"
            element={
              <Suspense fallback={<Skeleton />}>
                <PersonDetail people={people} />
              </Suspense>
            }
          />
        </Route>
        <Route path="form" element={<PageShell title="Form" />} />
        <Route path="forum" element={<PageShell title="Forum" />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
