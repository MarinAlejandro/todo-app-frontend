import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import TodoList from './TodoList'; // Adjust the path as necessary

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('TodoList Component', () => {
    beforeEach(() => {
        mockedAxios.get.mockClear();
        mockedAxios.post.mockClear();
        mockedAxios.put.mockClear();
        mockedAxios.delete.mockClear();
    });

    it('should render the list of duties fetched from the API', async () => {
        const mockDuties = [{ id: '1', name: 'Duty 1' }, { id: '2', name: 'Duty 2' }];
        mockedAxios.get.mockResolvedValue({ data: mockDuties });

        render(<TodoList />);

        // Check if the duties are rendered
        await waitFor(() => {
            expect(screen.getByText('Duty 1')).toBeInTheDocument();
            expect(screen.getByText('Duty 2')).toBeInTheDocument();
        });

        // Verify axios GET was called
        expect(mockedAxios.get).toHaveBeenCalledWith('/api/duties');
    });

    it('should allow the user to add a new duty', async () => {
        const mockNewDuty = { id: '3', name: 'New Duty' };
        mockedAxios.post.mockResolvedValue({ data: mockNewDuty });
        mockedAxios.get.mockResolvedValue({ data: [] });  // Empty duties list initially

        render(<TodoList />);

        // Simulate adding a new duty
        fireEvent.change(screen.getByPlaceholderText('New Duty'), { target: { value: 'New Duty' } });
        fireEvent.click(screen.getByText('Add Duty'));

        // Verify the post request and updated duties
        await waitFor(() => {
            expect(mockedAxios.post).toHaveBeenCalledWith('/api/duties', { name: 'New Duty' });
            expect(screen.getByText('New Duty')).toBeInTheDocument();
        });
    });

    it('should allow the user to edit an existing duty', async () => {
        const mockDuty = { id: '1', name: 'Original Duty' };
        const updatedDuty = { id: '1', name: 'Updated Duty' };
        mockedAxios.get.mockResolvedValue({ data: [mockDuty] });
        mockedAxios.put.mockResolvedValue({ data: updatedDuty });

        render(<TodoList />);

        // Simulate clicking "Edit" on the duty
        await waitFor(() => {
            fireEvent.click(screen.getByText('Edit'));
        });

        // Simulate editing the duty name
        fireEvent.change(screen.getByDisplayValue('Original Duty'), { target: { value: 'Updated Duty' } });
        fireEvent.click(screen.getByText('Save'));

        // Verify axios PUT was called
        await waitFor(() => {
            expect(mockedAxios.put).toHaveBeenCalledWith(`/api/duties/1`, { name: 'Updated Duty' });
            expect(screen.getByText('Updated Duty')).toBeInTheDocument();
        });
    });

    it('should allow the user to delete a duty', async () => {
        const mockDuties = [{ id: '1', name: 'Duty to Delete' }];
        mockedAxios.get.mockResolvedValue({ data: mockDuties });
        mockedAxios.delete.mockResolvedValue({});

        render(<TodoList />);

        // Simulate deleting the duty
        await waitFor(() => {
            fireEvent.click(screen.getByText('Delete'));
        });

        // Verify axios DELETE was called and the duty is removed from the UI
        await waitFor(() => {
            expect(mockedAxios.delete).toHaveBeenCalledWith('/api/duties/1');
            expect(screen.queryByText('Duty to Delete')).not.toBeInTheDocument();
        });
    });
});
