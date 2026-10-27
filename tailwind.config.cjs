module.exports = {
 content: ['./index.html','./*.{ts,tsx}','./components/**/*.{ts,tsx}','./screens/**/*.{ts,tsx}'],
 theme: { extend: { colors: { scifi: { bg:'var(--scifi-bg)',card:'var(--scifi-card)',primary:'var(--scifi-primary)',secondary:'var(--scifi-secondary)',accent:'var(--scifi-accent)',success:'var(--scifi-success)',text:'var(--scifi-text)',muted:'var(--scifi-muted)' } },
 animation: { 'pulse-slow':'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',shake:'shake 0.4s cubic-bezier(.36,.07,.19,.97) both' },
 keyframes: { shake: { '10%, 90%': { transform:'translate3d(-1px, 0, 0)' },'20%, 80%':{transform:'translate3d(2px, 0, 0)'},'30%, 50%, 70%':{transform:'translate3d(-4px, 0, 0)'},'40%, 60%':{transform:'translate3d(4px, 0, 0)'} } }
 } }, plugins: []
};
