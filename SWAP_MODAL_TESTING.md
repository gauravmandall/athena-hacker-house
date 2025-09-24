# Swap Modal Testing Guide

## How the System Works

### Logic Flow
1. **During Race**: 
   - Every time the player's car hits a banana peel, `bananaPeelCollisions` counter increases
   - Console logs: `Player hit banana peel! Total collisions: X`

2. **Race Completion**:
   - When race finishes, the system checks `playerController.bananaPeelCollisions`
   - If `bananaPeelCollisions === 0`: Swap modal opens after 1 second delay
   - If `bananaPeelCollisions > 0`: No swap modal (console shows message)

### Console Logs to Watch For
```javascript
// When player hits a banana peel:
"Player hit banana peel! Total collisions: 1"

// When race finishes:
"Race finished! Banana peel collisions: 0"
"Has avoided banana peels: true"
"Perfect run! Opening swap modal in 1 second..."
"Loading swap modal module..."
"SwapIntegration loaded successfully, showing modal..."

// Or if collisions occurred:
"Hit 2 banana peels - swap modal not shown"
```

## Testing Instructions

### Method 1: Debug Buttons
1. Look for **debug buttons** in the bottom-right corner of the screen
2. Click "Test Swap Modal (Perfect)" to simulate a perfect run
3. Click "Test Swap Modal (Collisions)" to see what happens with collisions

### Method 2: Play the Game
1. Start a race
2. **Avoid all banana peels** on the track
3. Complete the race
4. Wait 1 second after finishing
5. Swap modal should appear automatically

### Method 3: Console Testing
Open browser console and run:
```javascript
// Import the function
import('/src/components/SwapIntegration.js').then(({ showSwapModal }) => {
  // Show modal for perfect run
  showSwapModal({
    bananaPeelCollisions: 0,
    raceTime: 45.5,
    hasAvoidedBananaPeels: true
  });
});
```

## What You Should See

### Perfect Run (0 banana collisions):
- **Gold Achievement Banner**: "Perfect Run! No banana peels hit - Token Swap Unlocked!"
- **Rewards Section**: Shows base reward + 500 MON perfect run bonus
- **Swap Section**: Full token swap interface with:
  - Network selector (Monad, Ethereum, Polygon)
  - Token input fields
  - Slippage settings
  - Swap button

### With Collisions:
- **Silver Achievement Banner**: "Race Finished! X banana peel(s) hit"
- **Rewards Section**: Shows base reward only (no bonus)
- **Locked Message**: "Complete a race without hitting any banana peels to unlock token swapping!"

## Troubleshooting

### Modal Not Showing?
1. **Check Console**: Look for error messages
2. **Verify Collision Count**: Console should show `Banana peel collisions: 0`
3. **Wait for Delay**: Modal opens 1 second after race completion
4. **Check Z-Index**: Modal has z-index: 20000, should be on top

### Common Issues:
- **Import Error**: `Failed to load swap modal: [error]`
  - Solution: Check that all React components are properly compiled
  
- **Modal Shows Wrong Content**: 
  - Check `bananaPeelCollisions` value in console
  - Verify the collision tracking is working

- **No Debug Buttons**:
  - Refresh the page
  - Check that SwapModalDebug component is imported in App.tsx

### Testing Different Scenarios:

1. **Test Perfect Run**:
   - Play carefully and avoid all banana peels
   - Or use debug button "Test Swap Modal (Perfect)"

2. **Test Failed Run**:
   - Deliberately hit banana peels during race
   - Or use debug button "Test Swap Modal (Collisions)"

3. **Test Wallet Connection**:
   - Modal should show different UI based on wallet connection status
   - Without wallet: "Connect Wallet" message
   - With wallet: Full swap interface

## Code Locations

- **Collision Tracking**: `/src/services/effect/obstacle/banana-peel-obstacle.ts`
- **Race Completion Logic**: `/src/services/scoreboard/scoreboard.ts` (lines 150-180)
- **Swap Modal Component**: `/src/components/SwapModal.tsx`
- **Modal Integration**: `/src/components/SwapIntegration.tsx`
- **Debug Buttons**: `/src/components/SwapModalDebug.tsx`

## Expected Behavior Summary

✅ **Correct Behavior**:
- Player completes race WITHOUT hitting any banana peels → Swap modal opens
- Player hits 1+ banana peels → No swap modal, just regular results

❌ **Incorrect Behavior**:
- Modal opens when banana peels were hit
- Modal never opens even with perfect run
- Modal shows wrong collision count

## Live Testing Steps

1. Open browser console (F12)
2. Start the game
3. Begin a race
4. Watch console for collision logs
5. Complete the race
6. Check console for "Race finished!" message
7. Verify modal behavior matches collision count
