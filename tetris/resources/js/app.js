import './bootstrap';
setInterval(() => {
    Livewire.dispatch('tick')
}, 800)
