import { render, screen } from '@testing-library/react';
import { Badge } from '../badge';
import { describe, it, expect } from 'vitest';

describe('Badge', () => {
    it('renders with default variant', () => {
        render(<Badge>Default Badge</Badge>);
        const badge = screen.getByText('Default Badge');
        expect(badge).toBeInTheDocument();
        expect(badge).toHaveAttribute('data-variant', 'default');
    });

    it('renders with secondary variant', () => {
        render(<Badge variant="secondary">Secondary</Badge>);
        const badge = screen.getByText('Secondary');
        expect(badge).toHaveAttribute('data-variant', 'secondary');
    });

    it('renders with destructive variant', () => {
        render(<Badge variant="destructive">Error</Badge>);
        const badge = screen.getByText('Error');
        expect(badge).toHaveAttribute('data-variant', 'destructive');
    });

    it('renders with outline variant', () => {
        render(<Badge variant="outline">Outlined</Badge>);
        const badge = screen.getByText('Outlined');
        expect(badge).toHaveAttribute('data-variant', 'outline');
    });

    it('accepts custom className', () => {
        render(<Badge className="custom-class">Custom</Badge>);
        const badge = screen.getByText('Custom');
        expect(badge).toHaveClass('custom-class');
    });

    it('renders children correctly', () => {
        render(
            <Badge>
                <span>Complex</span> Content
            </Badge>
        );
        expect(screen.getByText('Complex')).toBeInTheDocument();
        expect(screen.getByText(/Content/)).toBeInTheDocument();
    });
});
