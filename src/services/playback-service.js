import TrackPlayer, { Event } from 'react-native-track-player';

// Este é o manipulador de eventos para quando o app está em segundo plano ou morto.
// As ações aqui devem apenas chamar os métodos do TrackPlayer,
// a lógica principal está no TrackPlayerService.ts
module.exports = async function() {
    TrackPlayer.addEventListener(Event.RemotePlay, () => TrackPlayer.play());
    TrackPlayer.addEventListener(Event.RemotePause, () => TrackPlayer.pause());
    TrackPlayer.addEventListener(Event.RemoteNext, () => TrackPlayer.skipToNext());
    TrackPlayer.addEventListener(Event.RemotePrevious, () => TrackPlayer.skipToPrevious());
    TrackPlayer.addEventListener(Event.RemoteStop, () => TrackPlayer.stop()); // ou TrackPlayer.destroy() se quiser parar completamente
    TrackPlayer.addEventListener(Event.RemoteSeek, (event) => TrackPlayer.seekTo(event.position));

    TrackPlayer.addEventListener(Event.RemoteDuck, async (event) => {
        // console.log('RemoteDuck event received', event);
        if (event.paused) { // Interrupção temporária (ex: notificação sonora)
            await TrackPlayer.pause();
        } else if (event.permanent) { // Interrupção permanente (ex: outra app de música começou a tocar)
            await TrackPlayer.stop(); // ou reset()
        } else { // Fim da interrupção
            await TrackPlayer.play();
        }
    });

    // Opcional: Lidar com o evento de quando a notificação é descartada
    // TrackPlayer.addEventListener(Event.RemoteDismissed, () => {
    //   TrackPlayer.stop();
    // });
};