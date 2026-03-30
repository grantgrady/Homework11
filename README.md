# Homework 11: p5.play Game - Particles, Combat and Win Conditions

## Name: Grant Grady

## Project Overview
A 2D action game where you must defeat all enemies by attacking them while collecting stars for points.

### Features
- **Animated Player**: Idle, walking, and attack animations
- **Combat System**: Press **X** to attack enemies within range
- **Particle Effects**: Visual feedback when enemies are hit
- **Enemy Health**: Each enemy has 3 HP, shown with health bars
- **Good Food**: Collect golden stars for points (respawns)
- **Obstacles**: Static obstacles block movement
- **Win Condition**: Defeat all enemies to win!

## How to Play

1. **Move**: WASD or Arrow Keys
2. **Attack**: Press X to attack nearby enemies
3. **Collect**: Touch golden stars to increase score
4. **Win**: Defeat all 5 enemies (each has 3 HP)

## Reflection

### Development Process

This assignment required extending my existing game to add a particle system, combat mechanics, and win conditions. I started by reviewing the requirements and planning the new features:

1. **Particle System**: Created a `Particle` class with position, velocity, lifespan, and fade effects
2. **Combat System**: Added attack input (X key) with cooldown and range checking
3. **Enemy Health**: Gave each enemy 3 HP with visual health bars
4. **Win Condition**: Game ends when all enemies are defeated

### Use of Generative AI

I used Generative AI (specifically DeepSeek) as a **development assistant** throughout this project. Here's how I used it:

1. **Debugging**: When keyboard input wasn't working, AI helped identify the issue and suggested manual event listeners

2. **Requirements Check**: AI helped verify all requirements were met

3. **Animation Logic**: AI provided guidance on creating attack animation frames

**Benefits:**
- Faster debugging of complex issues
- Learning best practices for particle systems
- Understanding game loop architecture
- Ensuring all requirements were addressed

**Challenges:**
- Had to carefully verify each requirement against the final code because it took out some code when i wanted to review.

### Use of Others' Code

I referenced:
- **p5.play Documentation**: https://p5play.org/learn/ - for sprite properties and collision detection
- **Daniel Shiffman's Particle System Tutorial**: Inspiration for the Particle class structure
- **p5.js Reference**: For drawing functions and animation techniques

All code was written by me, with AI assistance for debugging and conceptual guidance. The Particle class structure was adapted from common patterns while customized for my game's needs.


### Lessons Learned

1. **Particle Systems**: Understanding how to create and manage many short-lived objects
2. **Attack Mechanics**: Implementing cooldowns, range detection, and damage systems
3. **Win Conditions**: Managing game state and detecting completion
4. **Visual Feedback**: Using particles and health bars to improve user experience
5. **Event Handling**: Manual keyboard listeners as a fallback when library functions fail


## Assignment Requirements Checklist

- ✅ **Particle Class**: Complete with position, velocity, lifespan
- ✅ **Particle Integration**: Particles appear when enemies are attacked (X key)
- ✅ **Good Food**: 8 pieces, score increases, respawns on collection
- ✅ **Enemies with Health**: 3 HP each, lose health when attacked
- ✅ **Win Condition**: All enemies removed = "You Win" message
- ✅ **Code Organization**: Separate Particle class, arrays for particles and enemies

