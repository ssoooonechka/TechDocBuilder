import { create } from 'zustand';

const useRoomStore = create((set) => ({
  rooms: [],
  activeRoom: null,
  openedRooms: [],
  
  setRooms: (rooms) => set({ rooms }),
  setActiveRoom: (roomId) => set({ activeRoom: roomId }),
  
  addOpenedRoom: (roomId) => set((state) => ({
    openedRooms: [...new Set([...state.openedRooms, roomId])]
  })),
  
  removeOpenedRoom: (roomId) => set((state) => ({
    openedRooms: state.openedRooms.filter(id => id !== roomId),
    activeRoom: state.activeRoom === roomId ? 
      (state.openedRooms[0] || null) : 
      state.activeRoom
  }))
}));

export default useRoomStore;