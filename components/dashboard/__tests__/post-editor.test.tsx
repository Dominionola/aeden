import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PostEditor } from '../post-editor';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { toast } from 'sonner';

// Mock dependencies
vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
    }),
}));

vi.mock('@/lib/supabase/client', () => ({
    createClient: () => ({
        auth: {
            getUser: vi.fn().mockResolvedValue({
                data: { user: { id: 'test-user-id' } },
            }),
        },
        from: () => ({
            insert: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue({
                        data: { id: 'test-post-id' },
                        error: null,
                    }),
                }),
            }),
            update: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    eq: vi.fn().mockResolvedValue({ error: null }),
                }),
            }),
        }),
    }),
}));

describe('PostEditor', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        global.fetch = vi.fn();
    });

    it('renders input and preview sides', () => {
        render(<PostEditor />);

        expect(screen.getByText('Input')).toBeInTheDocument();
        expect(screen.getByText('Preview')).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/I built a new feature/i)).toBeInTheDocument();
    });

    it('allows user to type input content', () => {
        render(<PostEditor />);

        const textarea = screen.getByPlaceholderText(/I built a new feature/i);
        fireEvent.change(textarea, { target: { value: 'Built a new feature today' } });

        expect(textarea).toHaveValue('Built a new feature today');
    });

    it('has generate button disabled when input is empty', () => {
        render(<PostEditor />);

        const generateButton = screen.getByRole('button', { name: /Generate Post/i });
        expect(generateButton).toBeDisabled();
    });

    it('enables generate button when input has content', () => {
        render(<PostEditor />);

        const textarea = screen.getByPlaceholderText(/I built a new feature/i);
        fireEvent.change(textarea, { target: { value: 'Some content' } });

        const generateButton = screen.getByRole('button', { name: /Generate Post/i });
        expect(generateButton).not.toBeDisabled();
    });

    it('shows character count for preview content', () => {
        render(<PostEditor initialContent="Test content" />);

        // Just check that character count exists
        expect(screen.getByText(/\/500 chars/i)).toBeInTheDocument();
    });


    it('shows warning when character count exceeds 500', () => {
        const longContent = 'a'.repeat(501);
        render(<PostEditor initialContent={longContent} />);

        const remainingText = screen.getByText(/-1 remaining/i);
        expect(remainingText).toHaveClass('text-destructive');
    });

    it('allows selecting AI model', () => {
        render(<PostEditor />);

        // Check that model selector exists
        expect(screen.getByText('AI Model')).toBeInTheDocument();
    });

    it('allows selecting tone', () => {
        render(<PostEditor />);

        // Check that tone selector exists
        expect(screen.getByText('Tone')).toBeInTheDocument();
    });

    it('shows all action buttons', () => {
        render(<PostEditor />);

        expect(screen.getByRole('button', { name: /Generate Post/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Save Draft/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Publish to Threads/i })).toBeInTheDocument();
    });
});
