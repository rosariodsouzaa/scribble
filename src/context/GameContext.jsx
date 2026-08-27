import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';

const GameContext = createContext();

export const useGame = () => useContext(GameContext);

export const GameProvider = ({ children }) => {
  // Auth state
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('sr_user');
    return saved ? JSON.parse(saved) : {
      name: 'Bhakti',
      email: 'bhakti@scribble.io',
      role: 'Pro Player',
      coins: 2450,
      isAuthenticated: true
    };
  });

  // Wallet state
  const [wallet, setWallet] = useState(() => {
    const saved = localStorage.getItem('sr_wallet');
    return saved ? JSON.parse(saved) : {
      isConnected: false,
      address: null,
      balance: '1.25 ETH',
      network: 'Ethereum Mainnet'
    };
  });

  // Active Room state
  const [room, setRoom] = useState(() => {
    const saved = localStorage.getItem('sr_room');
    return saved ? JSON.parse(saved) : {
      code: 'S3MX3X',
      isHost: true,
      status: 'waiting',
      maxPlayers: 8
    };
  });

  // Players list in current room
  const [players, setPlayers] = useState(() => {
    const saved = localStorage.getItem('sr_players');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Bhakti', initial: 'B', isHost: true, isYou: true, isReady: true, score: 120, color: '#8b5cf6' },
      { id: '2', name: 'Player 2', initial: 'R', isHost: false, isYou: false, isReady: true, score: 100, color: '#ec4899' },
      { id: '3', name: 'Player 3', initial: 'A', isHost: false, isYou: false, isReady: false, score: 80, color: '#3b82f6' },
    ];
  });

  // Live Game round and status
  const [gameState, setGameState] = useState({
    round: 1,
    maxRounds: 3,
    currentWord: 'APPLE',
    timer: 45,
    isDrawing: true,
    drawerName: 'Bhakti',
    status: 'in_progress'
  });

  // Chat / Guess feed
  const [chatMessages, setChatMessages] = useState([
    { id: 1, type: 'system', text: 'Round 1 started! Bhakti is drawing.' },
    { id: 2, type: 'chat', author: 'Player 2', text: 'is it a fruit?' },
    { id: 3, type: 'chat', author: 'Player 3', text: 'banana' },
  ]);

  // Sync states to localStorage
  useEffect(() => {
    localStorage.setItem('sr_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('sr_wallet', JSON.stringify(wallet));
  }, [wallet]);

  useEffect(() => {
    localStorage.setItem('sr_room', JSON.stringify(room));
  }, [room]);

  useEffect(() => {
    localStorage.setItem('sr_players', JSON.stringify(players));
  }, [players]);

  // Auth actions
  const login = (email, password) => {
    const username = email.split('@')[0] || 'Bhakti';
    const capitalized = username.charAt(0).toUpperCase() + username.slice(1);
    const updatedUser = {
      name: capitalized || 'Bhakti',
      email: email,
      role: 'Pro Player',
      coins: 2450,
      isAuthenticated: true
    };
    setUser(updatedUser);
    return true;
  };

  const signup = (username, email, password) => {
    const updatedUser = {
      name: username || 'Bhakti',
      email: email,
      role: 'Pro Player',
      coins: 2450,
      isAuthenticated: true
    };
    setUser(updatedUser);
    return true;
  };

  const logout = () => {
    setUser({
      name: '',
      email: '',
      role: 'Player',
      coins: 0,
      isAuthenticated: false
    });
    setWallet({
      isConnected: false,
      address: null,
      balance: '0 ETH',
      network: 'Ethereum Mainnet'
    });
  };

  // Wallet actions with real window.ethereum + fallback support
  const connectWallet = async () => {
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts && accounts.length > 0) {
          const rawAddress = accounts[0];
          setWallet({
            isConnected: true,
            address: rawAddress,
            balance: '2.45 ETH',
            network: 'Ethereum Mainnet'
          });
          return rawAddress;
        }
      }
    } catch (err) {
      console.warn('MetaMask popup closed or rejected, falling back to simulated connection', err);
    }

    // Standard fallback simulated address for seamless user experience
    const mockAddress = '0xA83B92C7F19672804d98a00191F';
    setWallet({
      isConnected: true,
      address: mockAddress,
      balance: '2.45 ETH',
      network: 'Ethereum Mainnet'
    });
    return mockAddress;
  };

  const disconnectWallet = () => {
    setWallet({
      isConnected: false,
      address: null,
      balance: '0 ETH',
      network: 'Ethereum Mainnet'
    });
  };

  // Generate Room Code (e.g. S3MX3X)
  const generateRoomCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  // Create Room
  const createRoom = () => {
    const newCode = 'S3MX3X'; // or generateRoomCode()
    const currentUserName = user.name || 'Bhakti';
    const hostPlayer = {
      id: '1',
      name: `${currentUserName}`,
      initial: currentUserName.charAt(0).toUpperCase(),
      isHost: true,
      isYou: true,
      isReady: true,
      score: 120,
      color: '#8b5cf6'
    };

    setRoom({
      code: newCode,
      isHost: true,
      status: 'waiting',
      maxPlayers: 8
    });

    setPlayers([
      hostPlayer,
      { id: '2', name: 'Player 2', initial: 'R', isHost: false, isYou: false, isReady: true, score: 100, color: '#ec4899' },
      { id: '3', name: 'Player 3', initial: 'A', isHost: false, isYou: false, isReady: false, score: 80, color: '#3b82f6' },
    ]);

    return newCode;
  };

  // Join Room
  const joinRoom = (code) => {
    const formattedCode = (code || 'S3MX3X').trim().toUpperCase();
    const currentUserName = user.name || 'Bhakti';

    setRoom({
      code: formattedCode,
      isHost: false,
      status: 'waiting',
      maxPlayers: 8
    });

    setPlayers([
      { id: 'host-1', name: 'AlexSketch', initial: 'A', isHost: true, isYou: false, isReady: true, score: 140, color: '#fbbf24' },
      { id: '2', name: `${currentUserName}`, initial: currentUserName.charAt(0).toUpperCase(), isHost: false, isYou: true, isReady: false, score: 0, color: '#8b5cf6' },
      { id: '3', name: 'CyberArtist', initial: 'C', isHost: false, isYou: false, isReady: true, score: 90, color: '#06b6d4' },
    ]);

    return true;
  };

  // Toggle ready status
  const toggleReady = (playerId) => {
    setPlayers(prev => prev.map(p => {
      if (p.isYou || (playerId && p.id === playerId)) {
        return { ...p, isReady: !p.isReady };
      }
      return p;
    }));
  };

  // Start game
  const startGame = () => {
    setRoom(prev => ({ ...prev, status: 'playing' }));
    setGameState(prev => ({
      ...prev,
      round: 1,
      timer: 45,
      currentWord: 'APPLE',
      status: 'in_progress'
    }));
    triggerConfetti();
  };

  // Trigger win confetti
  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // ignore
    }
  };

  // Submit guess in chat
  const submitGuess = (guessText) => {
    if (!guessText.trim()) return;

    const trimmed = guessText.trim();
    const isCorrect = trimmed.toLowerCase() === gameState.currentWord.toLowerCase();

    if (isCorrect) {
      const newMsg = {
        id: Date.now(),
        type: 'correct',
        author: user.name,
        text: `🎉 ${user.name} guessed the word "${gameState.currentWord}" correctly! (+100 pts)`
      };
      setChatMessages(prev => [...prev, newMsg]);

      // Boost score
      setPlayers(prev => prev.map(p => {
        if (p.isYou) return { ...p, score: p.score + 100 };
        return p;
      }));

      triggerConfetti();
    } else {
      const newMsg = {
        id: Date.now(),
        type: 'chat',
        author: user.name,
        text: trimmed
      };
      setChatMessages(prev => [...prev, newMsg]);
    }
  };

  return (
    <GameContext.Provider
      value={{
        user,
        wallet,
        room,
        players,
        gameState,
        chatMessages,
        login,
        signup,
        logout,
        connectWallet,
        disconnectWallet,
        createRoom,
        joinRoom,
        toggleReady,
        startGame,
        submitGuess,
        triggerConfetti,
        setUser,
        setPlayers
      }}
    >
      {children}
    </GameContext.Provider>
  );
};
