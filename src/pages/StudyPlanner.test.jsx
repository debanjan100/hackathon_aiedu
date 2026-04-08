import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import StudyPlanner from './StudyPlanner';
import { supabase } from '../lib/supabaseClient';
import { AuthContext } from '../context/AuthContext';
import dayjs from 'dayjs';

// Mock Supabase
vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
    })),
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis(),
    })),
    removeChannel: vi.fn(),
  },
}));

const mockUser = { id: 'test-user-id' };

const renderWithAuth = (ui) => {
  return render(
    <AuthContext.Provider value={{ user: mockUser }}>
      {ui}
    </AuthContext.Provider>
  );
};

describe('StudyPlanner - Mark as Complete', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('optimistically updates UI and then calls database', async () => {
    const mockTasks = [
      { id: '1', title: 'Test Task', completed: false, is_completed: false, scheduled_date: dayjs().format('YYYY-MM-DD') }
    ];
    
    // Setup initial fetch
    supabase.from().select().eq().order.mockResolvedValue({ data: mockTasks, error: null });
    
    renderWithAuth(<StudyPlanner />);
    
    // Wait for tasks to load
    await waitFor(() => expect(screen.getByText('Test Task')).toBeDefined());
    
    // Find complete button and click it
    const completeBtn = screen.getByTestId('complete-btn-1'); // Assuming I add test IDs
    fireEvent.click(completeBtn);
    
    // Check optimistic update (should move to completed list)
    await waitFor(() => {
      expect(screen.queryByText('Test Task', { selector: '.task-chip span' })).toBeNull();
      expect(screen.getByText('Test Task', { selector: '.completed-list span' })).toBeDefined();
    });
    
    // Verify database call
    expect(supabase.from).toHaveBeenCalledWith('study_tasks');
    expect(supabase.from().update).toHaveBeenCalledWith(expect.objectContaining({ is_completed: true }));
  });

  it('reverts UI on database failure', async () => {
    const mockTasks = [
      { id: '1', title: 'Test Task', completed: false, is_completed: false, scheduled_date: dayjs().format('YYYY-MM-DD') }
    ];
    
    supabase.from().select().eq().order.mockResolvedValue({ data: mockTasks, error: null });
    supabase.from().update().eq.mockResolvedValue({ error: { message: 'Network Error' } });
    
    renderWithAuth(<StudyPlanner />);
    
    await waitFor(() => expect(screen.getByText('Test Task')).toBeDefined());
    
    const completeBtn = screen.getByTestId('complete-btn-1');
    fireEvent.click(completeBtn);
    
    // Should briefly disappear then reappear in original list after failure
    await waitFor(() => {
      expect(screen.getByText('Test Task', { selector: '.task-chip span' })).toBeDefined();
    });
  });
});

describe('StudyPlanner - Delete Task', () => {
  it('optimistically removes task and calls database', async () => {
    const mockTasks = [
      { id: '1', title: 'Task to Delete', completed: false, is_completed: false }
    ];
    
    supabase.from().select().eq().order.mockResolvedValue({ data: mockTasks, error: null });
    supabase.from().delete().eq.mockResolvedValue({ error: null });
    
    renderWithAuth(<StudyPlanner />);
    
    await waitFor(() => expect(screen.getByText('Task to Delete')).toBeDefined());
    
    const deleteBtn = screen.getByTestId('delete-btn-1');
    fireEvent.click(deleteBtn);
    
    // Should be gone from UI
    await waitFor(() => {
      expect(screen.queryByText('Task to Delete')).toBeNull();
    });
    
    expect(supabase.from().delete).toHaveBeenCalled();
  });
});
