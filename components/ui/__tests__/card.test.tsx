import { render, screen } from '@testing-library/react';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter
} from '../card';
import { describe, it, expect } from 'vitest';

describe('Card', () => {
    it('renders basic card', () => {
        render(<Card>Card content</Card>);
        const card = screen.getByText('Card content');
        expect(card).toBeInTheDocument();
        expect(card).toHaveAttribute('data-slot', 'card');
    });

    it('renders card with all subcomponents', () => {
        render(
            <Card>
                <CardHeader>
                    <CardTitle>Test Title</CardTitle>
                    <CardDescription>Test Description</CardDescription>
                </CardHeader>
                <CardContent>Content goes here</CardContent>
                <CardFooter>Footer content</CardFooter>
            </Card>
        );

        expect(screen.getByText('Test Title')).toBeInTheDocument();
        expect(screen.getByText('Test Description')).toBeInTheDocument();
        expect(screen.getByText('Content goes here')).toBeInTheDocument();
        expect(screen.getByText('Footer content')).toBeInTheDocument();
    });

    it('applies custom className to Card', () => {
        render(<Card className="custom-card">Content</Card>);
        const card = screen.getByText('Content');
        expect(card).toHaveClass('custom-card');
    });

    it('applies data-slot attributes correctly', () => {
        render(
            <Card>
                <CardHeader>
                    <CardTitle>Title</CardTitle>
                </CardHeader>
                <CardContent>Content</CardContent>
            </Card>
        );

        expect(screen.getByText('Title').closest('[data-slot="card-header"]')).toBeInTheDocument();
        expect(screen.getByText('Content').closest('[data-slot="card-content"]')).toBeInTheDocument();
    });

    it('renders CardFooter with proper slot', () => {
        render(
            <Card>
                <CardFooter>Footer</CardFooter>
            </Card>
        );

        const footer = screen.getByText('Footer');
        expect(footer).toHaveAttribute('data-slot', 'card-footer');
    });
});
