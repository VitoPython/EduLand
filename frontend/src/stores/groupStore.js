import { create } from 'zustand';
import api from '../api/api';

export const useGroupStore = create((set) => ({
    groups: [],
    currentGroup: null,
    isLoading: false,
    error: null,

    fetchGroups: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get('/groups');
            if (!Array.isArray(response.data)) {
                throw new Error('Invalid response format');
            }
            const groups = response.data.map(group => ({
                ...group,
                id: group._id
            }));
            set({ groups, isLoading: false, error: null });
        } catch (error) {
            console.error('Error fetching groups:', error);
            set({ 
                error: error.response?.data?.detail || error.message, 
                isLoading: false,
                groups: []
            });
        }
    },

    fetchGroup: async (groupId) => {
        if (!groupId) {
            console.error('Invalid group ID:', groupId);
            set({ error: 'Invalid group ID', isLoading: false });
            return;
        }
        set({ isLoading: true, error: null });
        try {
            console.log('Fetching group with ID:', groupId);
            const response = await api.get(`/groups/${groupId}`);
            const group = {
                ...response.data,
                id: response.data._id
            };
            set({ currentGroup: group, isLoading: false, error: null });
        } catch (error) {
            console.error('Error fetching group:', error);
            set({ 
                error: error.response?.data?.detail || error.message, 
                isLoading: false,
                currentGroup: null
            });
        }
    },

    createGroup: async (groupData) => {
        set({ isLoading: true });
        try {
            const response = await api.post('/groups', groupData);
            set(state => ({
                groups: [...state.groups, response.data],
                isLoading: false,
                error: null
            }));
            return response.data;
        } catch (error) {
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },

    updateGroup: async (groupId, groupData) => {
        set({ isLoading: true });
        try {
            const response = await api.put(`/groups/${groupId}`, groupData);
            set(state => ({
                groups: state.groups.map(group => 
                    group.id === groupId ? response.data : group
                ),
                currentGroup: response.data,
                isLoading: false,
                error: null
            }));
            return response.data;
        } catch (error) {
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },

    deleteGroup: async (groupId) => {
        set({ isLoading: true });
        try {
            await api.delete(`/groups/${groupId}`);
            set(state => ({
                groups: state.groups.filter(group => group.id !== groupId),
                isLoading: false,
                error: null
            }));
        } catch (error) {
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },

    addStudentToGroup: async (groupId, studentData) => {
        set({ isLoading: true });
        try {
            const response = await api.post(`/groups/${groupId}/students`, studentData);
            set(state => ({
                groups: state.groups.map(group => 
                    group.id === groupId ? response.data : group
                ),
                currentGroup: response.data,
                isLoading: false,
                error: null
            }));
            return response.data;
        } catch (error) {
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },

    removeStudentFromGroup: async (groupId, studentId) => {
        set({ isLoading: true });
        try {
            await api.delete(`/groups/${groupId}/students/${studentId}`);
            const updatedGroup = await api.get(`/groups/${groupId}`);
            set(state => ({
                groups: state.groups.map(group => 
                    group.id === groupId ? updatedGroup.data : group
                ),
                currentGroup: updatedGroup.data,
                isLoading: false,
                error: null
            }));
        } catch (error) {
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },

    clearCurrentGroup: () => set({ currentGroup: null }),
    clearError: () => set({ error: null })
})); 