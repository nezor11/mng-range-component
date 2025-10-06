import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react-dom/test-utils';

import Range from './Range';

test('renderiza dos sliders con ARIA en modo normal', () => {
  render(<Range mode="normal" min={0} max={100} initialMin={20} initialMax={80} />);
  const sliders = screen.getAllByRole('slider');
  expect(sliders).toHaveLength(2);
  expect(sliders[0]).toHaveAttribute('aria-valuemin', '0');
  expect(sliders[1]).toHaveAttribute('aria-valuemax', '100');
});

test('no cruza valores al mover con teclado', async () => {
  const user = userEvent.setup();
  render(<Range mode="normal" min={0} max={10} initialMin={4} initialMax={6} />);
  const [minH, maxH] = screen.getAllByRole('slider');

  minH.focus();
  await act(async () => {
    await user.keyboard('{End}');
  });

  await waitFor(() => {
    const minNow = Number(minH.getAttribute('aria-valuenow'));
    const maxNow = Number(maxH.getAttribute('aria-valuenow'));
    expect(minNow).toBeLessThanOrEqual(maxNow);
  });
});
