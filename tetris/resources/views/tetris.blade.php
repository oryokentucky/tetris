<!DOCTYPE html>
<html>
<head>
    <title>Tetris</title>
        <script src="https://cdn.tailwindcss.com"></script>
    @livewireStyles
    <style>
        /* Background gif/video fills the entire page behind everything */
        #bg-video, #bg-gif {
            position: fixed;
            top: 0; left: 0;
            width: 100%; height: 100%;
            object-fit: cover;
            z-index: 0;
            opacity: 0.4;          /* dim it so game is still readable */
        }

        /* Everything above the background */
        #game-wrapper {
            position: relative;
            z-index: 1;
        }
    </style>
</head>

<body>
<video id="bg-video" autoplay loop muted playsinline>
        <source src="{{ asset('videos/background.mp4') }}" type="video/mp4">
</video>
<div id="game-wrapper">
<h1 class="font-roboto text-4xl font-bold text-center mb-4">TeTORIS</h1>
<livewire:tetris-game />
@livewireScripts
<script src="{{ asset('js/tetris.js') }}"></script>
</div>

</body>
</html>
