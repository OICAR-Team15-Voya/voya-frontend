import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../ProtectedRoute';

/**
 * Test helper: renderira ProtectedRoute s djecom unutar MemoryRoutera.
 * Kad ProtectedRoute redirecta, vidi se sadržaj na /login.
 */
function renderWithRouter(ui: React.ReactNode, initialPath = '/private') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/login" element={<div>LOGIN PAGE</div>} />
        <Route path="/private" element={ui} />
        <Route path="/" element={<div>HOME PAGE</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('redirecta na /login kada token ne postoji', () => {
    renderWithRouter(
      <ProtectedRoute>
        <div>TAJNI SADRŽAJ</div>
      </ProtectedRoute>,
    );

    expect(screen.queryByText('TAJNI SADRŽAJ')).not.toBeInTheDocument();
    expect(screen.getByText('LOGIN PAGE')).toBeInTheDocument();
  });

  it('renderira djecu kada postoji token i nije zadana rola', () => {
    localStorage.setItem('token', 'jwt-test');
    localStorage.setItem(
      'currentUser',
      JSON.stringify({ userId: 1, role: 'ADMIN' }),
    );

    renderWithRouter(
      <ProtectedRoute>
        <div>TAJNI SADRŽAJ</div>
      </ProtectedRoute>,
    );

    expect(screen.getByText('TAJNI SADRŽAJ')).toBeInTheDocument();
  });

  it('redirecta admina kad ruta dopušta samo DRIVER', () => {
    localStorage.setItem('token', 'jwt-test');
    localStorage.setItem(
      'currentUser',
      JSON.stringify({ userId: 1, role: 'ADMIN' }),
    );

    renderWithRouter(
      <ProtectedRoute roles={['DRIVER']}>
        <div>SAMO ZA VOZAČA</div>
      </ProtectedRoute>,
    );

    expect(screen.queryByText('SAMO ZA VOZAČA')).not.toBeInTheDocument();
  });

  it('dopušta pristup vozaču na DRIVER ruti', () => {
    localStorage.setItem('token', 'jwt-test');
    localStorage.setItem(
      'currentUser',
      JSON.stringify({ userId: 5, role: 'DRIVER' }),
    );

    renderWithRouter(
      <ProtectedRoute roles={['DRIVER']}>
        <div>VOZAČKI EKRAN</div>
      </ProtectedRoute>,
    );

    expect(screen.getByText('VOZAČKI EKRAN')).toBeInTheDocument();
  });
});
