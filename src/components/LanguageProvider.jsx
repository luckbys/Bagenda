import React, { createContext, useState, useContext } from 'react';
import { IntlProvider } from 'react-intl';

const LanguageContext = createContext();

const messages = {
  'pt-BR': {
    "app.title": "Agenda Interativa",
    "nav.newEvent": "Criar novo evento",
    "nav.newTask": "Adicionar nova tarefa",
    "nav.resources": "Gerenciar Recursos",
    "nav.settings": "Configurações",
    "nav.help": "Ajuda",
    
    "help.title": "Como usar o sistema de arrastar e soltar",
    "help.reorder": "Reordenar itens",
    "help.reorder.desc": "Arraste eventos ou tarefas dentro de suas listas para reordená-los.",
    "help.taskToCalendar": "Tarefas para o calendário",
    "help.taskToCalendar.desc": "Arraste tarefas diretamente para uma data no calendário para criar um evento.",
    "help.moveEvents": "Mover eventos",
    "help.moveEvents.desc": "Arraste eventos no calendário para alterar suas datas.",
    "help.shareEvents": "Compartilhar eventos",
    "help.shareEvents.desc": "Compartilhe eventos com outras pessoas por email.",
    "help.recurringEvents": "Eventos recorrentes",
    "help.recurringEvents.desc": "Configure eventos que se repetem diariamente, semanalmente, mensalmente ou anualmente.",
    
    "events.title": "Eventos",
    "events.dragToReorder": "Arraste para reordenar",
    "events.view.list": "Visualização em lista",
    "events.view.grid": "Visualização em grade",
    "events.group.none": "Sem grupo",
    "events.group.date": "Por data",
    "events.group.category": "Por categoria",
    "events.group.priority": "Por prioridade",
    "events.sort.manual": "Manual",
    "events.sort.date": "Por data",
    "events.sort.title": "Por título",
    "events.sort.priority": "Por prioridade",
    "events.empty": "Nenhum evento adicionado",
    "events.emptyGroup": "Nenhum evento neste grupo",
    "events.created": "Evento criado com sucesso",
    "events.googleCalendarSync": "Evento sincronizado com o Google Agenda",
    "events.googleCalendarError": "Erro ao sincronizar com o Google Agenda",
    "events.webhookSync": "Evento enviado para automação",
    "events.webhookError": "Erro ao enviar evento para automação",
    
    "calendar.title": "Calendário",
    "calendar.dragTask": "Arraste tarefas para datas específicas",
    "calendar.today": "Hoje",
    "calendar.month": "Mês",
    "calendar.week": "Semana",
    "calendar.day": "Dia",
    "calendar.clickToCreate": "Clique em uma data para criar um evento",
    
    "modal.newEvent.title": "Criar Novo Evento",
    "modal.newEvent.category": "Categoria",
    "modal.newEvent.eventTitle": "Título",
    "modal.newEvent.location": "Local",
    "modal.newEvent.locationPlaceholder": "Digite o local do evento",
    "modal.newEvent.startDate": "Data de Início",
    "modal.newEvent.startTime": "Hora de Início",
    "modal.newEvent.endDate": "Data de Término",
    "modal.newEvent.endTime": "Hora de Término",
    "modal.newEvent.description": "Descrição",
    "modal.newEvent.descriptionPlaceholder": "Adicione detalhes sobre o evento",
    "modal.newEvent.recurrence": "Recorrência",
    "modal.newEvent.reminders": "Lembretes",
    "modal.newEvent.progress": "Progresso",
    "modal.newEvent.share": "Compartilhar",
    "modal.newEvent.create": "Criar Evento",
    "modal.newEvent.cancel": "Cancelar",
    "modal.newEvent.titleRequired": "O título do evento é obrigatório",
    "modal.newEvent.dateRequired": "A data de início é obrigatória",
    "modal.newEvent.syncWithGoogleCalendar": "Sincronizar com Google Agenda",
    
    "modal.newTask.title": "Adicionar Nova Tarefa",
    "modal.newTask.taskTitle": "Título da Tarefa",
    "modal.newTask.priority": "Prioridade",
    "modal.newTask.deadline": "Prazo",
    "modal.newTask.add": "Adicionar Tarefa",
    "modal.newTask.cancel": "Cancelar",
    
    "modal.share.title": "Compartilhar Evento",
    "modal.share.addPeople": "Adicionar pessoas",
    "modal.share.emailPlaceholder": "Digite o email da pessoa",
    "modal.share.sharedWith": "Compartilhado com",
    "modal.share.info": "As pessoas adicionadas receberão detalhes do evento por email",
    
    "priority.high": "Alta",
    "priority.medium": "Média",
    "priority.low": "Baixa",
    
    "category.meta": "Meta",
    "category.objetivo": "Objetivo",
    "category.evento": "Evento",
    "category.tarefa": "Tarefa",
    
    "recurrence.none": "Não se repete",
    "recurrence.daily": "Diariamente",
    "recurrence.weekly": "Semanalmente",
    "recurrence.monthly": "Mensalmente",
    "recurrence.yearly": "Anualmente",
    
    "time.minutes": "minutos",
    
    "tooltip.reminder": "Adicionar lembrete",
    "tooltip.share": "Compartilhar evento",
    "tooltip.webhook": "Enviar para automação",
    
    "breadcrumb.step1": "Informações básicas",
    "breadcrumb.step2": "Data e hora",
    "breadcrumb.step3": "Opções adicionais",
    
    "button.close": "Fechar",
    "button.save": "Salvar",
    "button.delete": "Excluir",
    "button.edit": "Editar",
    "button.next": "Avançar",
    "button.back": "Voltar",
    "modal.save": "Salvar",
    "modal.close": "Fechar",
    "modal.cancel": "Cancelar",

    "resources.meetingRoomA": "Sala de Reunião A",
    "resources.conferenceRoom": "Sala de Conferência",
    "resources.projector": "Projetor HD",
    "resources.companyCar": "Veículo da Empresa",
    
    "settings.google.title": "Google Agenda",
    "settings.google.connected": "Conectado ao Google Agenda",
    "settings.google.description": "Conecte-se ao Google Agenda para sincronizar seus eventos",
    "settings.google.lastSync": "Última sincronização: {date}",
    "settings.google.sync": "Sincronizar",
    "settings.google.disconnect": "Desconectar",
    "settings.google.syncSuccess": "Sincronização com Google Agenda realizada com sucesso!",
    "settings.google.syncError": "Erro ao sincronizar com Google Agenda",
    "settings.google.disconnected": "Desconectado do Google Agenda",
    
    "settings.webhook.title": "Webhook para automação",
    "settings.webhook.enable": "Ativar integração com n8n",
    "settings.webhook.url": "URL do webhook",
    
    "modal.eventDetails.datetime": "Data e hora",
    "modal.eventDetails.location": "Local",
    "modal.eventDetails.description": "Descrição",
    "modal.eventDetails.category": "Categoria",
    "modal.eventDetails.recurrence": "Recorrência",
    "modal.eventDetails.reminders": "Lembretes",
    "reminders.minutesBefore": "{minutes} minutos antes"
  }
};

const LanguageProvider = ({ children }) => {
  const [locale, setLocale] = useState('pt-BR');

  const switchLanguage = (newLocale) => {
    // Garantir que apenas pt-BR seja usado
    if (newLocale !== 'pt-BR') {
      newLocale = 'pt-BR';
    }
    setLocale(newLocale);
    localStorage.setItem('preferredLanguage', newLocale);
  };

  return (
    <LanguageContext.Provider value={{ locale, switchLanguage }}>
      <IntlProvider messages={messages[locale]} locale={locale}>
        {children}
      </IntlProvider>
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageProvider; 