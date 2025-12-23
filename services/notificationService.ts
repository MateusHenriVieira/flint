import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configuração: Como a notificação deve aparecer quando o app está aberto
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    // FIX: Propriedades obrigatórias nas versões novas do Expo SDK
    shouldShowBanner: true, 
    shouldShowList: true,
  }),
});

// Pedir permissão ao usuário
export async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    // Em produção, falhar silenciosamente ou logar erro
    console.log('Falha ao obter permissão para notificações!');
    return false;
  }
  return true;
}

// Agendar Notificação Recorrente (Ex: Todo dia 5)
export async function scheduleMonthlyReminder(title: string, body: string, day: number) {
  // A tipagem do trigger exige cuidado. Usamos 'any' no trigger ou a interface correta 
  // para evitar conflitos de versão do TS, mas a estrutura abaixo é a padrão do Expo.
  
  // Limpa notificações anteriores com o mesmo identificador (opcional, lógica simples)
  await Notifications.cancelAllScheduledNotificationsAsync();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: title,
      body: body,
      sound: true,
    },
    trigger: {
      channelId: 'default',
      type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
      day: day,
      hour: 9,
      minute: 0,
      repeats: true, 
    },
  });
  
  console.log(`Lembrete mensal agendado para o dia ${day}`);
}

// Agendar Notificação Única (Data específica)
export async function scheduleOneTimeNotification(title: string, body: string, date: Date) {
  await Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: { 
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: date 
    },
  });
}