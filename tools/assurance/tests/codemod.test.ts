import { rewriteSource } from '../src/codemod';

describe('documented-replacement codemod', () => {
  it('rewrites the changelog token on matched lines', () => {
    const source = `
      <mat-list-option checkboxPosition="before">Express shipping</mat-list-option>
    `;
    const next = rewriteSource(source, [{ from: 'checkboxPosition', to: 'togglePosition' }]);
    expect(next).toContain('togglePosition="before"');
    expect(next).not.toContain('checkboxPosition');
  });

  it('does not rewrite comments or unrelated attributes', () => {
    const source = `
      <!-- leftover checkboxPosition -->
      <mat-form-field appearance="legacy"></mat-form-field>
    `;
    expect(
      rewriteSource(source, [{ from: 'checkboxPosition', to: 'togglePosition' }]),
    ).toBe(source);
  });
});
