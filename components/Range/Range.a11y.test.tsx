import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Range from './Range';

test('no cruza valores al mover con teclado', async () => {
  const user = userEvent.setup();
  render(<Range mode="normal" min={0} max={10} initialMin={4} initialMax={6} />);
  const [minH, maxH] = screen.getAllByRole('slider');

  minH.focus();
  await user.keyboard('{End}');

  const minNow = Number(minH.getAttribute('aria-valuenow'));
  const maxNow = Number(maxH.getAttribute('aria-valuenow'));
  expect(minNow).toBeLessThanOrEqual(maxNow);
});
