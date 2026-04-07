// Mocking the API service and localStorage for isolated testing
import { renderHook, act } from '@testing-library/react-hooks';
import { useDashboardData } from '../useDashboardData';

// --- Setup Mocks ---
const mockFetchUserProfile = jest.fn();
jest.mock('../../services/userApiService', () => ({
    fetchUserProfile: mockFetchUserProfile,
    isAxiosError: (e: unknown) => typeof e === 'object' && e !== null // Simple mock guard
}));


describe('useDashboardData Hook Logic', () => {

    beforeEach(() => {
        // Clean up mocks and localStorage before each test
        jest.clearAllMocks();
        localStorage.clear(); 
    });

    it('1. Should load data successfully and update state correctly', async () => {
        // Setup successful API response mock
        mockFetchUserProfile.mockResolvedValue('User profile loaded successfully!');
        localStorage.setItem("accessToken", "valid_token");

        const { result } = renderHook(() => useDashboardData());

        // Initial State Check (Loading)
        expect(result.current.loading).toBe(true);
        
        // Wait for the async effect to run and resolve
        await act(async () => {}); 

        // Final State Check (Success)
        expect(result.current.loading).toBe(false);
        expect(result.current.data).toBe('User profile loaded successfully!');
        expect(result.current.error).toBeNull();
    });

    it('2. Should handle missing access token and set appropriate error state', async () => {
        // Ensure no token is present
        localStorage.removeItem("accessToken");
        mockFetchUserProfile.mockClear(); // Should not be called

        const { result } = renderHook(() => useDashboardData());

        await act(async () => {}); 

        // State Check (Error due to missing token)
        expect(result.current.loading).toBe(false);
        expect(result.current.data).toBeNull();
        expect(result.current.error).toContain('Authentication token is missing.');
    });

    it('3. Should handle API failure (network or server error)', async () => {
        // Mock the API to throw a general error
        mockFetchUserProfile.mockRejectedValueOnce(new Error("Network Timeout"));
        localStorage.setItem("accessToken", "valid_token");


        const { result } = renderHook(() => useDashboardData());

        await act(async () => {}); 

        // State Check (Error)
        expect(result.current.loading).toBe(false);
        expect(result.current.data).toBeNull();
        expect(result.current.error).toContain('Network Timeout');
    });

    it('4. Should clear the token upon receiving a 401 Unauthorized response', async () => {
        // Mocking an Axios error object specifically for 401 handling
        const mockAxiosError = new Error("Unauthorized");
        Object.defineProperty(mockAxiosError, 'isAxiosError', { value: true });
        Object.defineProperty(mockAxiosError, 'response', { value: { status: 401 } });
        
        mockFetchUserProfile.mockRejectedValueOnce(mockAxiosError);
        localStorage.setItem("accessToken", "expired_token");

        renderHook(() => useDashboardData());

        await act(async () => {}); 

        // Verify the side effect: token removal
        expect(localStorage.getItem('accessToken')).toBeNull(); 
    });
});
