import { create } from 'zustand';

export const useUIStore = create((set) => ({
    // Модальные окна
    modals: {
        course: {
            isOpen: false,
            selectedCourse: null
        },
        lesson: {
            isOpen: false,
            selectedLesson: null
        },
        assignment: {
            isOpen: false,
            selectedAssignment: null
        }
    },
    
    // Состояния загрузки для разных секций
    loading: {
        courses: false,
        lessons: false,
        assignments: false
    },
    
    // Методы для управления модальными окнами
    openModal: (modalType, selectedItem = null) => 
        set(state => ({
            modals: {
                ...state.modals,
                [modalType]: {
                    isOpen: true,
                    [`selected${modalType.charAt(0).toUpperCase() + modalType.slice(1)}`]: selectedItem
                }
            }
        })),
    
    closeModal: (modalType) => 
        set(state => ({
            modals: {
                ...state.modals,
                [modalType]: {
                    isOpen: false,
                    [`selected${modalType.charAt(0).toUpperCase() + modalType.slice(1)}`]: null
                }
            }
        })),
    
    // Методы для управления состоянием загрузки
    setLoading: (section, isLoading) => 
        set(state => ({
            loading: { ...state.loading, [section]: isLoading }
        })),
    
    // Сброс всех состояний
    resetUI: () => set({
        modals: {
            course: {
                isOpen: false,
                selectedCourse: null
            },
            lesson: {
                isOpen: false,
                selectedLesson: null
            },
            assignment: {
                isOpen: false,
                selectedAssignment: null
            }
        },
        loading: {
            courses: false,
            lessons: false,
            assignments: false
        }
    })
})); 