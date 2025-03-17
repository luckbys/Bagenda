import React, { useState, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { v4 as uuidv4 } from 'uuid';
import { useIntl } from 'react-intl';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { toast, Toaster } from 'react-hot-toast';
import AuroraBackground from './components/AuroraBackground';
import './App.css';

// Definição manual do locale pt-BR para o FullCalendar
const ptBrLocaleData = {
  code: 'pt-br',
  week: {
    dow: 0, // Domingo é o primeiro dia da semana
    doy: 4  // A semana que contém Jan 4th é a primeira semana do ano
  },
  buttonText: {
    prev: 'Anterior',
    next: 'Próximo',
    today: 'Hoje',
    month: 'Mês',
    week: 'Semana',
    day: 'Dia',
    list: 'Lista'
  },
  weekText: 'Sm',
  allDayText: 'Dia inteiro',
  moreLinkText: 'mais',
  noEventsText: 'Não há eventos para mostrar',
  dayHeaderFormat: { weekday: 'long' },
  slotLabelFormat: {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  },
  dayNames: [
    'Domingo',
    'Segunda-feira',
    'Terça-feira',
    'Quarta-feira',
    'Quinta-feira',
    'Sexta-feira',
    'Sábado'
  ],
  dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
  monthNames: [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro'
  ],
  monthNamesShort: [
    'Jan',
    'Fev',
    'Mar',
    'Abr',
    'Mai',
    'Jun',
    'Jul',
    'Ago',
    'Set',
    'Out',
    'Nov',
    'Dez'
  ]
};

    function App() {
  const intl = useIntl();
      const [events, setEvents] = useState([
    {
      id: uuidv4(),
      title: 'Corte de Cabelo - João Silva',
      start: new Date(2024, 1, 15, 10, 0),
      end: new Date(2024, 1, 15, 11, 0),
      extendedProps: {
        clientId: '1',
        serviceId: '1',
        professionalId: '1',
        price: 50.00,
        status: 'confirmed',
        notes: 'Cliente preferência por corte mais curto'
      }
    }
      ]);
      const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ title: '', priority: 'medium', deadline: '' });
      const [newEventTitle, setNewEventTitle] = useState('');
      const [newEventDate, setNewEventDate] = useState('');
  const [newEventTime, setNewEventTime] = useState('');
  const [newEventEndTime, setNewEventEndTime] = useState('');
  const [newEventLocation, setNewEventLocation] = useState('');
  const [newEventCategory, setNewEventCategory] = useState('evento');
  const [newEventDescription, setNewEventDescription] = useState('');
  const [newEventEndDate, setNewEventEndDate] = useState('');
  const [newEventProgress, setNewEventProgress] = useState(0);
  const [newEventRecurrence, setNewEventRecurrence] = useState('none'); // none, daily, weekly, monthly, yearly
  const [newEventReminders, setNewEventReminders] = useState(['30']); // minutos antes
  const [newEventSharedWith, setNewEventSharedWith] = useState([]);
  const [showShareModal, setShowShareModal] = useState(false);
      const [selectedEvent, setSelectedEvent] = useState(null);
      const [editEventTitle, setEditEventTitle] = useState('');
      const [editEventDate, setEditEventDate] = useState('');
  const [draggedItem, setDraggedItem] = useState(null);
  const calendarRef = useRef(null);
  const [showHelp, setShowHelp] = useState(false);
  const [eventGrouping, setEventGrouping] = useState('none'); // 'none', 'date', 'category', 'priority'
  const [eventSorting, setEventSorting] = useState('manual'); // 'manual', 'date', 'title', 'priority'
  const [eventView, setEventView] = useState('list'); // 'list', 'grid'
  const [showEventModal, setShowEventModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showEventDetailsModal, setShowEventDetailsModal] = useState(false);
  const [isGoogleSynced, setIsGoogleSynced] = useState(false);
  const [lastSyncDate, setLastSyncDate] = useState(null);
  const [formStep, setFormStep] = useState(1);
  
  // Adicionar categorias para eventos
  const [categories, setCategories] = useState([
    { id: 'meta', name: 'Meta', color: '#0d6efd' },
    { id: 'objetivo', name: 'Objetivo', color: '#198754' },
    { id: 'evento', name: 'Evento', color: '#fd7e14' },
    { id: 'tarefa', name: 'Tarefa', color: '#6c757d' }
  ]);
  
  // Adicionar recursos para eventos
  const [resources, setResources] = useState([
    { id: uuidv4(), name: intl.formatMessage({ id: 'resources.meetingRoomA' }), type: 'room', capacity: 10, color: '#8B5CF6' },
    { id: uuidv4(), name: intl.formatMessage({ id: 'resources.conferenceRoom' }), type: 'room', capacity: 20, color: '#6366F1' },
    { id: uuidv4(), name: intl.formatMessage({ id: 'resources.projector' }), type: 'equipment', color: '#F59E0B' },
    { id: uuidv4(), name: intl.formatMessage({ id: 'resources.companyCar' }), type: 'vehicle', color: '#10B981' }
  ]);

  // Adicionar estado para controlar integrações
  const [webhookEnabled, setWebhookEnabled] = useState(true);
  const [webhookUrl, setWebhookUrl] = useState('https://new2-n8n.rnsejy.easypanel.host/webhook-test/agendar');

  // Estados para gerenciamento do salão
  const [services, setServices] = useState([
    { 
      id: uuidv4(), 
      name: 'Corte de Cabelo Masculino', 
      duration: 30, 
      price: 50.00,
      category: 'corte',
      description: 'Corte tradicional masculino com máquina e tesoura'
    },
    { 
      id: uuidv4(), 
      name: 'Corte de Cabelo Feminino', 
      duration: 60, 
      price: 80.00,
      category: 'corte',
      description: 'Corte feminino com lavagem e finalização'
    },
    { 
      id: uuidv4(), 
      name: 'Barba', 
      duration: 30, 
      price: 35.00,
      category: 'barba',
      description: 'Barba tradicional com toalha quente e produtos especiais'
    }
  ]);

  const [professionals, setProfessionals] = useState([
    {
      id: uuidv4(),
      name: 'João Silva',
      specialties: ['corte', 'barba'],
      schedule: {
        start: '09:00',
        end: '18:00',
        breakStart: '12:00',
        breakEnd: '13:00'
      },
      color: '#0d6efd'
    },
    {
      id: uuidv4(),
      name: 'Maria Santos',
      specialties: ['corte', 'coloração', 'tratamento'],
      schedule: {
        start: '10:00',
        end: '19:00',
        breakStart: '13:00',
        breakEnd: '14:00'
      },
      color: '#198754'
    }
  ]);

  const [clients, setClients] = useState([
    {
      id: uuidv4(),
      name: 'Pedro Oliveira',
      phone: '(11) 99999-9999',
      email: 'pedro@email.com',
      preferences: 'Prefere corte curto na máquina 2',
      history: [],
      lastVisit: new Date(2024, 1, 15)
    }
  ]);

  const [products, setProducts] = useState([
    {
      id: uuidv4(),
      name: 'Shampoo Profissional',
      brand: 'HairPro',
      price: 45.00,
      stock: 10,
      category: 'cabelo',
      description: 'Shampoo para cabelos normais'
    }
  ]);

  // Estados para modais de cadastro
  const [showClientModal, setShowClientModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showProfessionalModal, setShowProfessionalModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);

  // Estados para formulários
  const [newClient, setNewClient] = useState({
    name: '',
    phone: '',
    email: '',
    preferences: ''
  });

  const [newService, setNewService] = useState({
    name: '',
    duration: 30,
    price: 0,
    category: '',
    description: ''
  });

  const [newProfessional, setNewProfessional] = useState({
    name: '',
    specialties: [],
    schedule: {
      start: '09:00',
      end: '18:00',
      breakStart: '12:00',
      breakEnd: '13:00'
    },
    color: '#0d6efd'
  });

  const [newProduct, setNewProduct] = useState({
    name: '',
    brand: '',
    price: 0,
    stock: 0,
    category: '',
    description: ''
  });

  // Categorias disponíveis
  const serviceCategories = [
    { id: 'corte', name: 'Corte', color: '#0d6efd' },
    { id: 'barba', name: 'Barba', color: '#198754' },
    { id: 'coloracao', name: 'Coloração', color: '#dc3545' },
    { id: 'tratamento', name: 'Tratamento', color: '#ffc107' },
    { id: 'manicure', name: 'Manicure', color: '#6610f2' },
    { id: 'pedicure', name: 'Pedicure', color: '#fd7e14' }
  ];

  // Estados para agendamento
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [selectedProfessional, setSelectedProfessional] = useState('');
  const [newEventDuration, setNewEventDuration] = useState(30);

  const [viewMode, setViewMode] = useState('list');
  const [groupBy, setGroupBy] = useState('none');
  const [sortBy, setSortBy] = useState('date');
  const [searchTerm, setSearchTerm] = useState('');

      const handleEventDrop = (info) => {
        const updatedEvents = events.map(event => {
          if (event.id === info.event.id) {
            return { ...event, start: info.event.start };
          }
          return event;
        });
        setEvents(updatedEvents);
      };

      const onDragEnd = (result) => {
    setDraggedItem(null);
    
        if (!result.destination) {
          return;
        }

        const reorderedEvents = Array.from(events);
        const [movedEvent] = reorderedEvents.splice(result.source.index, 1);
        reorderedEvents.splice(result.destination.index, 0, movedEvent);

        setEvents(reorderedEvents);
      };

  const onDragStart = (result) => {
    if (result.type === 'event') {
      const draggedEvent = events.find((event, index) => index === result.source.index);
      setDraggedItem({ type: 'event', item: draggedEvent });
    } else if (result.type === 'task') {
      const draggedTask = tasks.find((task, index) => index === result.source.index);
      setDraggedItem({ type: 'task', item: draggedTask });
    }
  };

  const handleTaskToEventDrop = (taskId, date) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      const newEvent = {
        id: uuidv4(),
        title: task.title,
        start: date,
        extendedProps: {
          priority: task.priority,
          originalTaskId: task.id
        },
        backgroundColor: task.priority === 'high' ? '#dc3545' : 
                         task.priority === 'medium' ? '#ffc107' : '#28a745',
        borderColor: task.priority === 'high' ? '#dc3545' : 
                     task.priority === 'medium' ? '#ffc107' : '#28a745',
      };
      
      setEvents([...events, newEvent]);
      
      // Enviar evento criado a partir da tarefa para o webhook
      if (webhookEnabled) {
        sendEventToWebhook(newEvent);
        toast.success(intl.formatMessage({ id: 'events.webhookSync' }));
      }
    };
  };

  const handleExternalDrop = (dropInfo) => {
    if (draggedItem && draggedItem.type === 'task') {
      handleTaskToEventDrop(draggedItem.item.id, dropInfo.date);
    }
  };

  // Função para enviar eventos para o webhook n8n
  const sendEventToWebhook = async (event) => {
    if (!webhookEnabled || !webhookUrl) return null;
    
    try {
      // Preparar dados do evento no formato esperado pelo n8n
      const eventData = {
        summary: event.title,
        description: event.extendedProps?.description || '',
        location: event.extendedProps?.location || '',
        start: {
          dateTime: new Date(event.start).toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        end: {
          dateTime: new Date(event.end || new Date(new Date(event.start).getTime() + 60 * 60 * 1000)).toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        recurrence: event.extendedProps?.recurrence !== 'none' ? event.extendedProps.recurrence : null,
        attendees: event.extendedProps?.sharedWith?.map(email => ({ email })) || [],
        reminders: {
          useDefault: false,
          overrides: event.extendedProps?.reminders?.map(minutes => ({
            method: 'email',
            minutes: parseInt(minutes)
          })) || []
        },
        // Campos adicionais específicos da aplicação
        category: event.extendedProps?.category || 'evento',
        progress: event.extendedProps?.progress || 0,
        allDay: event.allDay || false
      };
      
      // Enviar para o webhook
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Resposta do webhook n8n:', data);
      
      // Exibir mensagem de sucesso
      toast.success(intl.formatMessage({ id: 'events.webhookSync' }));
      return data;
    } catch (error) {
      console.error('Erro ao enviar evento para webhook:', error);
      toast.error(intl.formatMessage({ id: 'events.webhookError' }));
      return null;
    }
  };

      const handleCreateEvent = () => {
    if (selectedClient && selectedService && selectedProfessional && newEventDate && newEventTime) {
      const service = services.find(s => s.id === selectedService);
      const client = clients.find(c => c.id === selectedClient);
      const professional = professionals.find(p => p.id === selectedProfessional);

      const startDateTime = new Date(`${newEventDate}T${newEventTime}`);
      const endDateTime = new Date(startDateTime.getTime() + newEventDuration * 60000);

          const newEvent = {
            id: uuidv4(),
        title: `${service.name} - ${client.name}`,
        start: startDateTime,
        end: endDateTime,
        extendedProps: {
          clientId: selectedClient,
          serviceId: selectedService,
          professionalId: selectedProfessional,
          description: newEventDescription,
          price: service.price,
          duration: newEventDuration,
          status: 'confirmado'
        },
        backgroundColor: professional.color,
        borderColor: professional.color,
        classNames: ['salon-event']
      };

          setEvents([...events, newEvent]);

      // Atualizar histórico do cliente
      const updatedClients = clients.map(c => {
        if (c.id === selectedClient) {
          return {
            ...c,
            history: [...c.history, {
              date: startDateTime,
              serviceId: selectedService,
              professionalId: selectedProfessional,
              price: service.price
            }],
            lastVisit: startDateTime
          };
        }
        return c;
      });
      setClients(updatedClients);

      // Enviar para webhook se habilitado
      if (webhookEnabled) {
        sendEventToWebhook(newEvent);
      }

      // Limpar formulário
      setSelectedClient('');
      setSelectedService('');
      setSelectedProfessional('');
          setNewEventDate('');
      setNewEventTime('');
      setNewEventEndTime('');
      setNewEventDuration(30);
      setNewEventDescription('');
      setFormStep(1);

      // Fechar modal e mostrar mensagem de sucesso
      setShowEventModal(false);
      toast.success('Agendamento realizado com sucesso!');
    }
  };

  const generateRecurrentEvents = (baseEvent) => {
    const events = [baseEvent];
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 12); // Gerar eventos para 1 ano

    let currentDate = new Date(baseEvent.start);
    while (currentDate < endDate) {
      let nextDate = new Date(currentDate);
      
      switch (baseEvent.extendedProps.recurrence) {
        case 'daily':
          nextDate.setDate(nextDate.getDate() + 1);
          break;
        case 'weekly':
          nextDate.setDate(nextDate.getDate() + 7);
          break;
        case 'monthly':
          nextDate.setMonth(nextDate.getMonth() + 1);
          break;
        case 'yearly':
          nextDate.setFullYear(nextDate.getFullYear() + 1);
          break;
      }

      if (nextDate < endDate) {
        const duration = baseEvent.end - baseEvent.start;
        const recurrentEvent = {
          ...baseEvent,
          id: uuidv4(),
          start: new Date(nextDate),
          end: new Date(nextDate.getTime() + duration)
        };
        events.push(recurrentEvent);
      }
      
      currentDate = nextDate;
    }

    return events;
  };

  const scheduleReminders = (event) => {
    event.extendedProps.reminders.forEach(minutes => {
      const reminderTime = new Date(event.start.getTime() - minutes * 60000);
      const now = new Date();
      
      if (reminderTime > now) {
        const timeoutId = setTimeout(() => {
          if (Notification.permission === "granted") {
            new Notification(`Lembrete: ${event.title}`, {
              body: `Seu evento começa em ${minutes} minutos\nLocal: ${event.extendedProps.location || 'Não especificado'}`,
              icon: '/calendar-icon.png'
            });
          }
          
          // Enviar e-mail se configurado
          if (event.extendedProps.sharedWith.length > 0) {
            sendReminderEmail(event, minutes);
          }
        }, reminderTime - now);

        // Armazenar ID do timeout para poder cancelar se necessário
        event.extendedProps.reminderTimeouts = event.extendedProps.reminderTimeouts || [];
        event.extendedProps.reminderTimeouts.push(timeoutId);
      }
    });
  };

  const sendReminderEmail = async (event, minutes) => {
    // Implementar integração com serviço de e-mail
    console.log(`Enviando e-mail de lembrete para ${event.extendedProps.sharedWith.join(', ')}`);
  };

      const handleEventClick = (info) => {
        setSelectedEvent(info.event);
    setShowEventDetailsModal(true);
      };

      const handleEditEvent = () => {
        if (selectedEvent) {
          const updatedEvents = events.map(event => {
            if (event.id === selectedEvent.id) {
              return { ...event, title: editEventTitle, start: new Date(editEventDate) };
            }
            return event;
          });
          setEvents(updatedEvents);
          setSelectedEvent(null);
        }
      };

      const handleDeleteEvent = () => {
        if (selectedEvent) {
          const updatedEvents = events.filter(event => event.id !== selectedEvent.id);
          setEvents(updatedEvents);
          setSelectedEvent(null);
        }
      };

      const handleTaskInputChange = (e) => {
        setNewTask({ ...newTask, [e.target.name]: e.target.value });
      };

      const handleAddTask = () => {
        if (newTask.title) {
          setTasks([...tasks, { ...newTask, id: uuidv4() }]);
      setNewTask({ title: '', priority: 'medium', deadline: '' });
        }
      };

      const handleDeleteTask = (id) => {
        setTasks(tasks.filter(task => task.id !== id));
      };

      const onTaskDragEnd = (result) => {
    setDraggedItem(null);
    
        if (!result.destination) {
          return;
        }

        const reorderedTasks = Array.from(tasks);
        const [movedTask] = reorderedTasks.splice(result.source.index, 1);
        reorderedTasks.splice(result.destination.index, 0, movedTask);

        setTasks(reorderedTasks);
      };

  const onTaskDragStart = (result) => {
    const draggedTask = tasks.find((task, index) => index === result.source.index);
    setDraggedItem({ type: 'task', item: draggedTask });
  };

  const handleDateClick = (info) => {
    if (draggedItem && draggedItem.type === 'task') {
      handleTaskToEventDrop(draggedItem.item.id, info.date);
      setDraggedItem(null);
    } else {
      // Formatar a data para o formato YYYY-MM-DD
      const clickedDate = new Date(info.date);
      const formattedDate = clickedDate.toISOString().split('T')[0];
      
      // Definir a data selecionada no estado
      setNewEventDate(formattedDate);
      
      // Abrir o modal de criação de evento
      setShowEventModal(true);
    }
  };

  // Função para agrupar eventos
  const groupEvents = (events, groupBy) => {
    if (groupBy === 'none') {
      return [{
        id: 'all',
        title: 'Todos os Agendamentos',
        events: events
      }];
    }

    const groups = {};
    events.forEach(event => {
      let groupKey;
      
      if (groupBy === 'date') {
        groupKey = new Date(event.start).toLocaleDateString();
      } else if (groupBy === 'professional') {
        const professional = professionals.find(p => p.id === event.extendedProps.professionalId);
        groupKey = professional ? professional.name : 'Sem Profissional';
      } else if (groupBy === 'service') {
        const service = services.find(s => s.id === event.extendedProps.serviceId);
        groupKey = service ? service.name : 'Sem Serviço';
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(event);
    });

    return Object.entries(groups).map(([key, events]) => ({
      id: key,
      title: key,
      events: events
    }));
  };

  // Função para ordenar eventos
  const sortEvents = (events, sortBy) => {
    return [...events].sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(a.start) - new Date(b.start);
      } else if (sortBy === 'price') {
        return a.extendedProps.price - b.extendedProps.price;
      } else if (sortBy === 'duration') {
        const durationA = new Date(a.end) - new Date(a.start);
        const durationB = new Date(b.end) - new Date(b.start);
        return durationA - durationB;
      }
      return 0;
    });
  };

  // Função para filtrar eventos por termo de busca
  const filterEvents = (events, searchTerm) => {
    if (!searchTerm) return events;
    
    const term = searchTerm.toLowerCase();
    return events.filter(event => {
      const client = clients.find(c => c.id === event.extendedProps.clientId);
      const professional = professionals.find(p => p.id === event.extendedProps.professionalId);
      const service = services.find(s => s.id === event.extendedProps.serviceId);

      return (
        client?.name.toLowerCase().includes(term) ||
        professional?.name.toLowerCase().includes(term) ||
        service?.name.toLowerCase().includes(term) ||
        event.title.toLowerCase().includes(term)
      );
    });
  };

  // Função para lidar com o drag end entre grupos
  const onDragEndBetweenGroups = (result) => {
    setDraggedItem(null);
    
    if (!result.destination) {
      return;
    }

    // Se o arrasto for dentro do mesmo grupo
    if (result.source.droppableId === result.destination.droppableId) {
      const reorderedEvents = Array.from(events);
      const sourceIndex = parseInt(result.source.index);
      const destinationIndex = parseInt(result.destination.index);
      
      const [movedEvent] = reorderedEvents.splice(sourceIndex, 1);
      reorderedEvents.splice(destinationIndex, 0, movedEvent);
      
      setEvents(reorderedEvents);
    } 
    // Se o arrasto for entre grupos diferentes
    else {
      // Extrair informações do grupo de destino
      const destinationGroupId = result.destination.droppableId;
      
      // Atualizar o evento com base no grupo de destino
      const updatedEvents = events.map((event, index) => {
        if (index === parseInt(result.source.index)) {
          const updatedEvent = { ...event };
          
          // Atualizar propriedades com base no grupo de destino
          if (eventGrouping === 'date') {
            updatedEvent.start = new Date(destinationGroupId);
          } else if (eventGrouping === 'category') {
            const category = categories.find(c => c.name === destinationGroupId);
            if (category) {
              updatedEvent.extendedProps = {
                ...updatedEvent.extendedProps,
                category: category.id
              };
              updatedEvent.backgroundColor = category.color;
              updatedEvent.borderColor = category.color;
            }
          } else if (eventGrouping === 'priority') {
            updatedEvent.extendedProps = {
              ...updatedEvent.extendedProps,
              priority: destinationGroupId
            };
          }
          
          return updatedEvent;
        }
        return event;
      });
      
      setEvents(updatedEvents);
    }
  };

  const syncEventsWithGoogle = async (token) => {
    try {
      // Buscar eventos do Google Agenda
      console.log('Iniciando requisição para o Google Agenda');
      
      const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.error('Erro na resposta da API:', response.status);
        throw new Error(`Erro na API do Google Agenda: ${response.status}`);
      }

      const data = await response.json();
      console.log('Eventos recebidos do Google Agenda:', data);

      // Sincronizar eventos locais com o Google Agenda
      const eventsToSync = events.map(event => ({
        summary: event.title,
        description: event.extendedProps?.description || '',
        start: {
          dateTime: new Date(event.start).toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        end: {
          dateTime: new Date(event.end || new Date(new Date(event.start).getTime() + 60 * 60 * 1000)).toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      }));

      // Enviar eventos para o Google Agenda
      for (const event of eventsToSync) {
        try {
          const syncResponse = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(event)
          });

          if (!syncResponse.ok) {
            console.error('Erro ao sincronizar evento:', syncResponse.status);
          }
        } catch (error) {
          console.error('Erro ao sincronizar evento:', error);
        }
      }

      return data.items;
    } catch (error) {
      console.error('Erro na sincronização:', error);
      throw error;
    }
  };

  const handleManualSync = async () => {
    try {
      const token = localStorage.getItem('googleToken');
      if (!token) {
        throw new Error('Não autenticado');
      }
      
      await syncEventsWithGoogle(token);
      setLastSyncDate(new Date().toISOString());
      alert(intl.formatMessage({ id: 'settings.google.syncSuccess' }));
    } catch (error) {
      console.error('Erro na sincronização manual:', error);
      alert(intl.formatMessage({ id: 'settings.google.syncError' }));
    }
  };

  const handleDisconnectGoogle = () => {
    localStorage.removeItem('googleToken');
    setIsGoogleSynced(false);
    setLastSyncDate(null);
    alert(intl.formatMessage({ id: 'settings.google.disconnected' }));
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      console.log('Login no Google realizado com sucesso');
      const { credential } = credentialResponse;
      
      // Salvar o token
      localStorage.setItem('googleToken', credential);
      setIsGoogleSynced(true);
      
      // Sincronizar eventos
      await syncEventsWithGoogle(credential);
      setLastSyncDate(new Date().toISOString());
      alert('Sincronização com Google Agenda realizada com sucesso!');
    } catch (error) {
      console.error('Erro no login do Google:', error);
      setIsGoogleSynced(false);
      alert('Erro ao sincronizar com o Google Agenda. Por favor, tente novamente.');
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'meta':
        return 'bi-bullseye';
      case 'objetivo':
        return 'bi-flag';
      case 'evento':
        return 'bi-calendar-event';
      case 'tarefa':
        return 'bi-check-square';
      default:
        return 'bi-calendar-event';
    }
  };

  const formatEventDate = (event) => {
    const start = new Date(event.start);
    const end = event.end ? new Date(event.end) : null;
    
    if (event.allDay) {
      return start.toLocaleDateString();
    }
    
    if (end) {
      if (start.toDateString() === end.toDateString()) {
        return `${start.toLocaleDateString()} ${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      } else {
        return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
      }
    }
    
    return `${start.toLocaleDateString()} ${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  // Handlers para formulários
  const handleAddClient = () => {
    const client = {
      ...newClient,
      id: uuidv4(),
      history: [],
      lastVisit: null
    };
    setClients([...clients, client]);
    setNewClient({ name: '', phone: '', email: '', preferences: '' });
    setShowClientModal(false);
    toast.success('Cliente cadastrado com sucesso!');
  };

  const handleAddService = () => {
    const service = {
      ...newService,
      id: uuidv4()
    };
    setServices([...services, service]);
    setNewService({
      name: '',
      duration: 30,
      price: 0,
      category: '',
      description: ''
    });
    setShowServiceModal(false);
    toast.success('Serviço cadastrado com sucesso!');
  };

  const handleAddProfessional = () => {
    const professional = {
      ...newProfessional,
      id: uuidv4()
    };
    setProfessionals([...professionals, professional]);
    setNewProfessional({
      name: '',
      specialties: [],
      schedule: {
        start: '09:00',
        end: '18:00',
        breakStart: '12:00',
        breakEnd: '13:00'
      },
      color: '#0d6efd'
    });
    setShowProfessionalModal(false);
    toast.success('Profissional cadastrado com sucesso!');
  };

  const handleAddProduct = () => {
    const product = {
      ...newProduct,
      id: uuidv4()
    };
    setProducts([...products, product]);
    setNewProduct({
      name: '',
      brand: '',
      price: 0,
      stock: 0,
      category: '',
      description: ''
    });
    setShowProductModal(false);
    toast.success('Produto cadastrado com sucesso!');
  };

  // Atualizar o cabeçalho
  return (
    <GoogleOAuthProvider clientId="301770710898-nlkb9lea02sk9irh4vpdth0m0ingrv90.apps.googleusercontent.com">
      <div className="container-fluid py-4">
        <AuroraBackground />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#fff',
              color: '#333',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
              borderRadius: '0.5rem',
              padding: '0.75rem 1rem',
              fontSize: '0.9rem'
            }
          }}
        />
        
        {/* Cabeçalho */}
        <div className="d-flex align-items-center justify-content-between mb-4">
          <h1 className="mb-0">Agenda do Salão</h1>
          <div className="d-flex align-items-center gap-2">
            <div className="btn-group">
              <button
                className="btn btn-primary"
                onClick={() => setShowEventModal(true)}
                title="Novo Agendamento"
              >
                <i className="bi bi-calendar-plus me-1"></i>
                Agendar
              </button>
              <button
                className="btn btn-outline-primary"
                onClick={() => setShowClientModal(true)}
                title="Novo Cliente"
              >
                <i className="bi bi-person-plus me-1"></i>
                Cliente
              </button>
            </div>
            <div className="btn-group">
              <button
                className="btn btn-success"
                onClick={() => setShowServiceModal(true)}
                title="Novo Serviço"
              >
                <i className="bi bi-scissors me-1"></i>
                Serviço
              </button>
              <button
                className="btn btn-info text-white"
                onClick={() => setShowProfessionalModal(true)}
                title="Novo Profissional"
              >
                <i className="bi bi-person-badge me-1"></i>
                Profissional
              </button>
            </div>
            <button
              className="btn btn-warning"
              onClick={() => setShowProductModal(true)}
              title="Novo Produto"
            >
              <i className="bi bi-box-seam me-1"></i>
              Produto
            </button>
            <button
              className="btn btn-outline-secondary"
              onClick={() => setShowSettingsModal(true)}
              title="Configurações"
            >
              <i className="bi bi-gear me-1"></i>
              Configurações
            </button>
          </div>
              </div>

        {/* Layout Principal */}
        <div className="row">
          {/* Lista de Eventos */}
          <div className="col-md-3 mb-4">
            <div className="card">
              <div className="card-header bg-warning text-dark">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h2 className="h5 mb-0">{intl.formatMessage({ id: 'events.title' })}</h2>
                  <small className="text-dark">{intl.formatMessage({ id: 'events.dragToReorder' })}</small>
                </div>
                <div className="d-flex gap-2 flex-wrap">
                  <div className="btn-group btn-group-sm">
                    <button 
                      className={`btn ${eventView === 'list' ? 'btn-warning' : 'btn-outline-warning'}`}
                      onClick={() => setEventView('list')}
                      title={intl.formatMessage({ id: 'events.view.list' })}
                    >
                      <i className="bi bi-list-ul"></i>
                    </button>
                    <button 
                      className={`btn ${eventView === 'grid' ? 'btn-warning' : 'btn-outline-warning'}`}
                      onClick={() => setEventView('grid')}
                      title={intl.formatMessage({ id: 'events.view.grid' })}
                    >
                      <i className="bi bi-grid"></i>
                    </button>
              </div>

                  <select 
                    className="form-select form-select-sm" 
                    value={eventGrouping}
                    onChange={(e) => setEventGrouping(e.target.value)}
                    style={{ maxWidth: '120px' }}
                  >
                    <option value="none">{intl.formatMessage({ id: 'events.group.none' })}</option>
                    <option value="date">{intl.formatMessage({ id: 'events.group.date' })}</option>
                    <option value="category">{intl.formatMessage({ id: 'events.group.category' })}</option>
                    <option value="priority">{intl.formatMessage({ id: 'events.group.priority' })}</option>
                  </select>
                  
                  <select 
                    className="form-select form-select-sm" 
                    value={eventSorting}
                    onChange={(e) => setEventSorting(e.target.value)}
                    style={{ maxWidth: '120px' }}
                  >
                    <option value="manual">{intl.formatMessage({ id: 'events.sort.manual' })}</option>
                    <option value="date">{intl.formatMessage({ id: 'events.sort.date' })}</option>
                    <option value="title">{intl.formatMessage({ id: 'events.sort.title' })}</option>
                    <option value="priority">{intl.formatMessage({ id: 'events.sort.priority' })}</option>
                  </select>
              </div>
            </div>
              <div className="card-body p-2">
                <DragDropContext onDragEnd={onDragEnd} onDragStart={onDragStart}>
                  <Droppable droppableId="events-list" type="event">
                    {(provided, snapshot) => (
                      <div 
                        className={`${snapshot.isDraggingOver ? 'dragging-over' : ''}`} 
                        {...provided.droppableProps} 
                        ref={provided.innerRef}
                      >
                        <div className={eventView === 'list' ? 'list-group' : 'row g-2'}>
                          {sortEvents(events, eventSorting).map((event, index) => (
                          <Draggable key={event.id} draggableId={event.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                  className={`event-item ${snapshot.isDragging ? 'dragging' : ''}`}
                                  data-category={event.extendedProps?.category || 'evento'}
                                  onClick={() => handleEventClick({ event })}
                              >
                                  <div className="event-content">
                                    <div className="event-title">
                                      <i className={`bi ${getCategoryIcon(event.extendedProps?.category)}`}></i>
                                {event.title}
                                      <span className="event-category-badge" style={{
                                        backgroundColor: categories.find(c => c.id === event.extendedProps?.category)?.color + '20',
                                        color: categories.find(c => c.id === event.extendedProps?.category)?.color
                                      }}>
                                        {categories.find(c => c.id === event.extendedProps?.category)?.name}
                                      </span>
                                    </div>
                                    
                                    <div className="event-meta">
                                      <div className="event-date">
                                        <i className="bi bi-calendar-event"></i>
                                        {formatEventDate(event)}
                                      </div>
                                      {event.extendedProps?.location && (
                                        <div className="event-location">
                                          <i className="bi bi-geo-alt"></i>
                                          {event.extendedProps.location}
                                        </div>
                                      )}
                                    </div>
                                    
                                    {(event.extendedProps?.category === 'meta' || event.extendedProps?.category === 'objetivo') && (
                                      <div className="event-progress">
                                        <div 
                                          className="event-progress-bar" 
                                          style={{ width: `${event.extendedProps?.progress || 0}%` }}
                                        ></div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        </div>
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </div>
            </div>
              </div>

          {/* Calendário */}
          <div className="col-md-9 mb-4">
            <div className="card">
              <div className="card-header bg-primary text-white">
                <h5 className="card-title mb-0">
                  <i className="bi bi-calendar3 me-2"></i>
                  {intl.formatMessage({ id: 'calendar.title' })}
                </h5>
              </div>
              <div className="card-body p-0">
                <FullCalendar
                  ref={calendarRef}
                  plugins={[dayGridPlugin, interactionPlugin]}
                  initialView="dayGridMonth"
                  events={events}
                  editable={true}
                  droppable={true}
                  eventDrop={handleEventDrop}
                  eventClick={handleEventClick}
                  dateClick={handleDateClick}
                  drop={handleExternalDrop}
                  locale={ptBrLocaleData}
                  headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay'
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Botão de ajuda flutuante */}
        <button 
          className="btn btn-info rounded-circle position-fixed"
          style={{ bottom: '20px', right: '20px', width: '50px', height: '50px', zIndex: 1050 }}
          onClick={() => setShowHelp(true)}
        >
          <i className="bi bi-question-lg"></i>
        </button>

        {/* Modal de ajuda */}
        {showHelp && (
          <div className="modal fade show" style={{ display: 'block' }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content">
                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-title">
                    <i className="bi bi-question-circle me-2"></i>
                    {intl.formatMessage({ id: 'help.title' })}
                  </h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setShowHelp(false)}></button>
                </div>
                <div className="modal-body">
                  <div className="row g-4">
                    <div className="col-md-6">
                      <div className="card h-100">
                        <div className="card-body">
                          <h5 className="card-title d-flex align-items-center mb-3">
                            <i className="bi bi-arrow-down-up me-2 text-primary"></i>
                            {intl.formatMessage({ id: 'help.reorder' })}
                          </h5>
                          <p className="card-text">{intl.formatMessage({ id: 'help.reorder.desc' })}</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="card h-100">
                        <div className="card-body">
                          <h5 className="card-title d-flex align-items-center mb-3">
                            <i className="bi bi-calendar-plus me-2 text-success"></i>
                            {intl.formatMessage({ id: 'help.taskToCalendar' })}
                          </h5>
                          <p className="card-text">{intl.formatMessage({ id: 'help.taskToCalendar.desc' })}</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="card h-100">
                        <div className="card-body">
                          <h5 className="card-title d-flex align-items-center mb-3">
                            <i className="bi bi-arrows-move me-2 text-warning"></i>
                            {intl.formatMessage({ id: 'help.moveEvents' })}
                          </h5>
                          <p className="card-text">{intl.formatMessage({ id: 'help.moveEvents.desc' })}</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="card h-100">
                        <div className="card-body">
                          <h5 className="card-title d-flex align-items-center mb-3">
                            <i className="bi bi-share me-2 text-info"></i>
                            {intl.formatMessage({ id: 'help.shareEvents' })}
                          </h5>
                          <p className="card-text">{intl.formatMessage({ id: 'help.shareEvents.desc' })}</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="card h-100">
                        <div className="card-body">
                          <h5 className="card-title d-flex align-items-center mb-3">
                            <i className="bi bi-arrow-repeat me-2 text-secondary"></i>
                            {intl.formatMessage({ id: 'help.recurringEvents' })}
                          </h5>
                          <p className="card-text">{intl.formatMessage({ id: 'help.recurringEvents.desc' })}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Agendamento */}
        {showEventModal && (
          <div className="modal fade show" style={{ display: 'block' }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content">
                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-title">
                    <i className="bi bi-calendar-plus me-2"></i>
                    Novo Agendamento
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close btn-close-white" 
                    onClick={() => {
                      setShowEventModal(false);
                      setFormStep(1);
                      setSelectedClient('');
                      setSelectedService('');
                      setSelectedProfessional('');
                      setNewEventDate('');
                      setNewEventTime('');
                      setNewEventDescription('');
                    }}
                  ></button>
                </div>
                <div className="modal-body">
                  {/* Breadcrumb */}
                  <nav aria-label="breadcrumb" className="mb-4">
                    <ol className="breadcrumb">
                      <li className={`breadcrumb-item ${formStep === 1 ? 'active' : ''}`}>
                        <button 
                          className="btn btn-link p-0 border-0 bg-transparent"
                          onClick={() => setFormStep(1)}
                          disabled={formStep === 1}
                        >
                          <i className="bi bi-1-circle me-1"></i>
                          Cliente e Serviço
                        </button>
                      </li>
                      <li className={`breadcrumb-item ${formStep === 2 ? 'active' : ''}`}>
                        <button 
                          className="btn btn-link p-0 border-0 bg-transparent"
                          onClick={() => setFormStep(2)}
                          disabled={formStep === 2 || !selectedClient || !selectedService}
                        >
                          <i className="bi bi-2-circle me-1"></i>
                          Profissional e Horário
                        </button>
                      </li>
                      <li className={`breadcrumb-item ${formStep === 3 ? 'active' : ''}`}>
                        <button 
                          className="btn btn-link p-0 border-0 bg-transparent"
                          onClick={() => setFormStep(3)}
                          disabled={formStep === 3 || !selectedProfessional || !newEventDate}
                        >
                          <i className="bi bi-3-circle me-1"></i>
                          Confirmação
                        </button>
                      </li>
                    </ol>
                  </nav>

                  <form onSubmit={(e) => { e.preventDefault(); handleCreateEvent(); }}>
                    {/* Etapa 1: Cliente e Serviço */}
                    {formStep === 1 && (
                      <div className="step-content">
                        <div className="mb-4">
                          <label className="form-label">
                            <i className="bi bi-person me-2"></i>
                            Selecione o Cliente
                          </label>
                          <div className="input-group mb-2">
                            <select
                              className="form-select"
                              value={selectedClient}
                              onChange={(e) => setSelectedClient(e.target.value)}
                              required
                            >
                              <option value="">Selecione um cliente...</option>
                              {clients.map(client => (
                                <option key={client.id} value={client.id}>
                                  {client.name} - {client.phone}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              className="btn btn-outline-primary"
                              onClick={() => setShowClientModal(true)}
                            >
                              <i className="bi bi-person-plus"></i>
                            </button>
                          </div>
                          {selectedClient && (
                            <div className="client-info p-2 bg-light rounded">
                              <small className="text-muted">
                                {clients.find(c => c.id === selectedClient)?.preferences || 'Sem preferências registradas'}
                              </small>
                            </div>
                          )}
                        </div>

                        <div className="mb-4">
                          <label className="form-label">
                            <i className="bi bi-scissors me-2"></i>
                            Selecione o Serviço
                          </label>
                          <select
                            className="form-select"
                            value={selectedService}
                            onChange={(e) => {
                              setSelectedService(e.target.value);
                              const service = services.find(s => s.id === e.target.value);
                              if (service) {
                                setNewEventDuration(service.duration);
                              }
                            }}
                            required
                          >
                            <option value="">Selecione um serviço...</option>
                            {serviceCategories.map(category => (
                              <optgroup key={category.id} label={category.name}>
                                {services
                                  .filter(service => service.category === category.id)
                                  .map(service => (
                                    <option key={service.id} value={service.id}>
                                      {service.name} - R$ {service.price.toFixed(2)} ({service.duration}min)
                                    </option>
                                  ))}
                              </optgroup>
                            ))}
                          </select>
                        </div>

                        <div className="mb-3">
                          <label className="form-label">
                            <i className="bi bi-card-text me-2"></i>
                            Observações
                          </label>
                          <textarea
                            className="form-control"
                            value={newEventDescription}
                            onChange={(e) => setNewEventDescription(e.target.value)}
                            placeholder="Observações especiais para o atendimento..."
                            rows="3"
                          ></textarea>
                        </div>
                      </div>
                    )}

                    {/* Etapa 2: Profissional e Horário */}
                    {formStep === 2 && (
                      <div className="step-content">
                        <div className="mb-4">
                          <label className="form-label">
                            <i className="bi bi-person-badge me-2"></i>
                            Selecione o Profissional
                          </label>
                          <select
                            className="form-select"
                            value={selectedProfessional}
                            onChange={(e) => setSelectedProfessional(e.target.value)}
                            required
                          >
                            <option value="">Selecione um profissional...</option>
                            {professionals
                              .filter(prof => {
                                const service = services.find(s => s.id === selectedService);
                                return service ? prof.specialties.includes(service.category) : true;
                              })
                              .map(professional => (
                                <option key={professional.id} value={professional.id}>
                                  {professional.name} - {professional.specialties.map(s => 
                                    serviceCategories.find(cat => cat.id === s)?.name
                                  ).join(', ')}
                                </option>
                              ))}
                          </select>
                        </div>

                        <div className="row mb-4">
                          <div className="col-md-6">
                            <label className="form-label">
                              <i className="bi bi-calendar-date me-2"></i>
                              Data
                            </label>
                            <input
                              type="date"
                              className="form-control"
                              value={newEventDate}
                              onChange={(e) => setNewEventDate(e.target.value)}
                              min={new Date().toISOString().split('T')[0]}
                              required
                            />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label">
                              <i className="bi bi-clock me-2"></i>
                              Horário
                            </label>
                            <input
                              type="time"
                              className="form-control"
                              value={newEventTime}
                              onChange={(e) => setNewEventTime(e.target.value)}
                              required
                            />
                          </div>
              </div>

                        {selectedProfessional && (
                          <div className="professional-schedule p-3 bg-light rounded">
                            <h6 className="mb-2">Horário do Profissional</h6>
                            <div className="d-flex justify-content-between">
                              <small>
                                <i className="bi bi-clock-history me-1"></i>
                                Expediente: {professionals.find(p => p.id === selectedProfessional)?.schedule.start} - {professionals.find(p => p.id === selectedProfessional)?.schedule.end}
                              </small>
                              <small>
                                <i className="bi bi-cup-hot me-1"></i>
                                Intervalo: {professionals.find(p => p.id === selectedProfessional)?.schedule.breakStart} - {professionals.find(p => p.id === selectedProfessional)?.schedule.breakEnd}
                              </small>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Etapa 3: Confirmação */}
                    {formStep === 3 && (
                      <div className="step-content">
                        <div className="confirmation-details">
                          <div className="detail-item">
                            <div className="detail-label">Cliente:</div>
                            <div className="detail-value">
                              {clients.find(c => c.id === selectedClient)?.name}
                            </div>
                          </div>
                          <div className="detail-item">
                            <div className="detail-label">Serviço:</div>
                            <div className="detail-value">
                              {services.find(s => s.id === selectedService)?.name}
                              <span className="badge bg-success ms-2">
                                R$ {services.find(s => s.id === selectedService)?.price.toFixed(2)}
                              </span>
                            </div>
                          </div>
                          <div className="detail-item">
                            <div className="detail-label">Profissional:</div>
                            <div className="detail-value">
                              {professionals.find(p => p.id === selectedProfessional)?.name}
                            </div>
                          </div>
                          <div className="detail-item">
                            <div className="detail-label">Data e Hora:</div>
                            <div className="detail-value">
                              {new Date(`${newEventDate}T${newEventTime}`).toLocaleDateString()} às {newEventTime}
                              <small className="text-muted ms-2">
                                (Duração: {newEventDuration} minutos)
                              </small>
                            </div>
                          </div>
                          {newEventDescription && (
                            <div className="detail-item">
                              <div className="detail-label">Observações:</div>
                              <div className="detail-value">{newEventDescription}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="modal-footer">
                      {formStep > 1 && (
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => setFormStep(formStep - 1)}
                        >
                          <i className="bi bi-arrow-left me-1"></i>
                          Voltar
                        </button>
                      )}
                      {formStep < 3 ? (
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={() => setFormStep(formStep + 1)}
                          disabled={
                            (formStep === 1 && (!selectedClient || !selectedService)) ||
                            (formStep === 2 && (!selectedProfessional || !newEventDate || !newEventTime))
                          }
                        >
                          Próximo
                          <i className="bi bi-arrow-right ms-1"></i>
                        </button>
                      ) : (
                        <button
                          type="submit"
                          className="btn btn-success"
                        >
                          <i className="bi bi-check-lg me-1"></i>
                          Confirmar Agendamento
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de criação de tarefa */}
        {showTaskModal && (
          <div className="modal fade show" style={{ display: 'block' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header bg-secondary text-white">
                  <h5 className="modal-title">
                    <i className="bi bi-check-square me-2"></i>
                    {intl.formatMessage({ id: 'modal.newTask.title' })}
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close btn-close-white" 
                    onClick={() => setShowTaskModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <form onSubmit={(e) => { e.preventDefault(); handleAddTask(); setShowTaskModal(false); }}>
                    <div className="mb-3">
                      <label className="form-label">{intl.formatMessage({ id: 'modal.newTask.title' })}</label>
                  <input
                    type="text"
                        className="form-control"
                        name="title"
                        value={newTask.title}
                        onChange={handleTaskInputChange}
                        placeholder={intl.formatMessage({ id: 'modal.newTask.titlePlaceholder' })}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">{intl.formatMessage({ id: 'modal.newTask.priority' })}</label>
                      <select
                        className="form-select"
                        name="priority"
                        value={newTask.priority}
                        onChange={handleTaskInputChange}
                      >
                        <option value="low">{intl.formatMessage({ id: 'priority.low' })}</option>
                        <option value="medium">{intl.formatMessage({ id: 'priority.medium' })}</option>
                        <option value="high">{intl.formatMessage({ id: 'priority.high' })}</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">{intl.formatMessage({ id: 'modal.newTask.deadline' })}</label>
                  <input
                    type="date"
                        className="form-control"
                        name="deadline"
                        value={newTask.deadline}
                        onChange={handleTaskInputChange}
                      />
                    </div>
                    <div className="modal-footer">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setShowTaskModal(false)}
                      >
                        {intl.formatMessage({ id: 'modal.cancel' })}
                      </button>
                      <button type="submit" className="btn btn-primary">
                        {intl.formatMessage({ id: 'modal.save' })}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
                  </div>
                </div>
              )}

        {/* Modal de configurações */}
        {showSettingsModal && (
          <div className="modal fade show" style={{ display: 'block' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header bg-secondary text-white">
                  <h5 className="modal-title">
                    <i className="bi bi-gear me-2"></i>
                    {intl.formatMessage({ id: 'modal.settings.title' })}
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close btn-close-white" 
                    onClick={() => setShowSettingsModal(false)}
                  ></button>
            </div>
                <div className="modal-body">
                  <div className="mb-4">
                    <h6>{intl.formatMessage({ id: 'settings.google.title' })}</h6>
                    {isGoogleSynced ? (
                      <div>
                        <p className="text-success">
                          <i className="bi bi-check-circle me-2"></i>
                          {intl.formatMessage({ id: 'settings.google.connected' })}
                        </p>
                        {lastSyncDate && (
                          <p className="text-muted small">
                            {intl.formatMessage(
                              { id: 'settings.google.lastSync' },
                              { date: new Date(lastSyncDate).toLocaleString() }
                            )}
                          </p>
                        )}
                        <div className="btn-group">
                          <button 
                            className="btn btn-outline-primary btn-sm"
                            onClick={handleManualSync}
                          >
                            <i className="bi bi-arrow-repeat me-1"></i>
                            {intl.formatMessage({ id: 'settings.google.sync' })}
                          </button>
                          <button 
                            className="btn btn-outline-danger btn-sm"
                            onClick={handleDisconnectGoogle}
                          >
                            <i className="bi bi-x-circle me-1"></i>
                            {intl.formatMessage({ id: 'settings.google.disconnect' })}
                          </button>
          </div>
        </div>
                    ) : (
                      <div>
                        <p className="text-muted">
                          {intl.formatMessage({ id: 'settings.google.description' })}
                        </p>
                        <GoogleLogin
                          onSuccess={handleGoogleSuccess}
                          onError={() => {
                            console.log('Login Failed');
                          }}
                        />
                      </div>
                    )}
                  </div>
                  <div className="mb-4">
                    <h6>{intl.formatMessage({ id: 'settings.webhook.title' })}</h6>
                    <div className="form-check form-switch mb-2">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="webhookEnabled"
                        checked={webhookEnabled}
                        onChange={(e) => setWebhookEnabled(e.target.checked)}
                      />
                      <label className="form-check-label" htmlFor="webhookEnabled">
                        {intl.formatMessage({ id: 'settings.webhook.enable' })}
                      </label>
                    </div>
                    {webhookEnabled && (
                      <div className="mb-3">
                        <label className="form-label">{intl.formatMessage({ id: 'settings.webhook.url' })}</label>
                        <input
                          type="url"
                          className="form-control"
                          value={webhookUrl}
                          onChange={(e) => setWebhookUrl(e.target.value)}
                          placeholder="https://..."
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowSettingsModal(false)}
                  >
                    {intl.formatMessage({ id: 'modal.close' })}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de detalhes do evento */}
        {showEventDetailsModal && selectedEvent && (
          <div className="modal fade show event-details-modal" style={{ display: 'block' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header" style={{
                  background: professionals.find(p => p.id === selectedEvent.extendedProps?.professionalId)?.color,
                  color: 'white'
                }}>
                  <h5 className="modal-title d-flex align-items-center gap-2">
                    <i className="bi bi-calendar-event"></i>
                    {selectedEvent.title}
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close btn-close-white" 
                    onClick={() => setShowEventDetailsModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="event-details">
                    {/* Cliente */}
                    <div className="event-detail-item">
                      <div className="detail-icon">
                        <i className="bi bi-person"></i>
                      </div>
                      <div className="detail-content">
                        <h6>Cliente</h6>
                        <p className="mb-0">
                          {clients.find(c => c.id === selectedEvent.extendedProps?.clientId)?.name}
                        </p>
                        <small className="text-muted">
                          {clients.find(c => c.id === selectedEvent.extendedProps?.clientId)?.phone}
                        </small>
                      </div>
                    </div>

                    {/* Serviço */}
                    <div className="event-detail-item">
                      <div className="detail-icon">
                        <i className="bi bi-scissors"></i>
                      </div>
                      <div className="detail-content">
                        <h6>Serviço</h6>
                        <p className="mb-0">
                          {services.find(s => s.id === selectedEvent.extendedProps?.serviceId)?.name}
                        </p>
                        <div className="d-flex align-items-center gap-3">
                          <small className="text-muted">
                            <i className="bi bi-clock me-1"></i>
                            {selectedEvent.extendedProps?.duration} minutos
                          </small>
                          <small className="text-success">
                            <i className="bi bi-currency-dollar me-1"></i>
                            R$ {selectedEvent.extendedProps?.price.toFixed(2)}
                          </small>
                        </div>
                      </div>
                    </div>

                    {/* Profissional */}
                    <div className="event-detail-item">
                      <div className="detail-icon">
                        <i className="bi bi-person-badge"></i>
                      </div>
                      <div className="detail-content">
                        <h6>Profissional</h6>
                        <p className="mb-0">
                          {professionals.find(p => p.id === selectedEvent.extendedProps?.professionalId)?.name}
                        </p>
                      </div>
                    </div>

                    {/* Data e Hora */}
                    <div className="event-detail-item">
                      <div className="detail-icon">
                        <i className="bi bi-clock"></i>
                      </div>
                      <div className="detail-content">
                        <h6>Data e Hora</h6>
                        <p className="mb-0">
                          {new Date(selectedEvent.start).toLocaleDateString()} - {new Date(selectedEvent.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {selectedEvent.end && (
                            <>
                              <br />
                              <small className="text-muted">
                                Término previsto: {new Date(selectedEvent.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </small>
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="event-detail-item">
                      <div className="detail-icon">
                        <i className="bi bi-check-circle"></i>
                      </div>
                      <div className="detail-content">
                        <h6>Status</h6>
                        <span className={`badge bg-${getStatusColor(selectedEvent.extendedProps?.status)}`}>
                          {getStatusText(selectedEvent.extendedProps?.status)}
                        </span>
                      </div>
                    </div>

                    {/* Observações */}
                    {selectedEvent.extendedProps?.description && (
                      <div className="event-detail-item">
                        <div className="detail-icon">
                          <i className="bi bi-card-text"></i>
                        </div>
                        <div className="detail-content">
                          <h6>Observações</h6>
                          <p className="mb-0">{selectedEvent.extendedProps.description}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-outline-danger"
                    onClick={handleDeleteEvent}
                  >
                    <i className="bi bi-trash me-1"></i>
                    Cancelar Agendamento
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setShowEventDetailsModal(false)}
                  >
                    <i className="bi bi-check2 me-1"></i>
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Cadastro de Cliente */}
        {showClientModal && (
          <div className="modal fade show" style={{ display: 'block' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-title">
                    <i className="bi bi-person-plus me-2"></i>
                    {intl.formatMessage({ id: 'modal.client.title' })}
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close btn-close-white" 
                    onClick={() => setShowClientModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <form onSubmit={(e) => { e.preventDefault(); handleAddClient(); }}>
                    <div className="mb-3">
                      <label className="form-label">Nome</label>
                      <input
                        type="text"
                        className="form-control"
                        value={newClient.name}
                        onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Telefone</label>
                      <input
                        type="tel"
                        className="form-control"
                        value={newClient.phone}
                        onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">E-mail</label>
                      <input
                        type="email"
                        className="form-control"
                        value={newClient.email}
                        onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Preferências/Observações</label>
                      <textarea
                        className="form-control"
                        value={newClient.preferences}
                        onChange={(e) => setNewClient({ ...newClient, preferences: e.target.value })}
                        rows="3"
                      ></textarea>
                    </div>
                    <div className="modal-footer">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setShowClientModal(false)}
                      >
                        Cancelar
                      </button>
                      <button type="submit" className="btn btn-primary">
                        Salvar
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Cadastro de Serviço */}
        {showServiceModal && (
          <div className="modal fade show" style={{ display: 'block' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header bg-success text-white">
                  <h5 className="modal-title">
                    <i className="bi bi-scissors me-2"></i>
                    {intl.formatMessage({ id: 'modal.service.title' })}
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close btn-close-white" 
                    onClick={() => setShowServiceModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <form onSubmit={(e) => { e.preventDefault(); handleAddService(); }}>
                    <div className="mb-3">
                      <label className="form-label">Nome do Serviço</label>
                      <input
                        type="text"
                        className="form-control"
                        value={newService.name}
                        onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Categoria</label>
                      <select
                        className="form-select"
                        value={newService.category}
                        onChange={(e) => setNewService({ ...newService, category: e.target.value })}
                        required
                      >
                        <option value="">Selecione uma categoria</option>
                        {serviceCategories.map(category => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="row mb-3">
                      <div className="col">
                        <label className="form-label">Duração (minutos)</label>
                        <input
                          type="number"
                          className="form-control"
                          value={newService.duration}
                          onChange={(e) => setNewService({ ...newService, duration: parseInt(e.target.value) })}
                          min="15"
                          step="15"
                          required
                        />
                      </div>
                      <div className="col">
                        <label className="form-label">Preço (R$)</label>
                        <input
                          type="number"
                          className="form-control"
                          value={newService.price}
                          onChange={(e) => setNewService({ ...newService, price: parseFloat(e.target.value) })}
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Descrição</label>
                      <textarea
                        className="form-control"
                        value={newService.description}
                        onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                        rows="3"
                      ></textarea>
                    </div>
                    <div className="modal-footer">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setShowServiceModal(false)}
                      >
                        Cancelar
                      </button>
                      <button type="submit" className="btn btn-success">
                        Salvar
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Cadastro de Profissional */}
        {showProfessionalModal && (
          <div className="modal fade show" style={{ display: 'block' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header bg-info text-white">
                  <h5 className="modal-title">
                    <i className="bi bi-person-badge me-2"></i>
                    {intl.formatMessage({ id: 'modal.professional.title' })}
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close btn-close-white" 
                    onClick={() => setShowProfessionalModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <form onSubmit={(e) => { e.preventDefault(); handleAddProfessional(); }}>
                    <div className="mb-3">
                      <label className="form-label">Nome</label>
                      <input
                        type="text"
                        className="form-control"
                        value={newProfessional.name}
                        onChange={(e) => setNewProfessional({ ...newProfessional, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Especialidades</label>
                      <div className="d-flex flex-wrap gap-2">
                        {serviceCategories.map(category => (
                          <div key={category.id} className="form-check">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              id={`specialty-${category.id}`}
                              checked={newProfessional.specialties.includes(category.id)}
                              onChange={(e) => {
                                const specialties = e.target.checked
                                  ? [...newProfessional.specialties, category.id]
                                  : newProfessional.specialties.filter(s => s !== category.id);
                                setNewProfessional({ ...newProfessional, specialties });
                              }}
                            />
                            <label className="form-check-label" htmlFor={`specialty-${category.id}`}>
                              {category.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col">
                        <label className="form-label">Início do Expediente</label>
                        <input
                          type="time"
                          className="form-control"
                          value={newProfessional.schedule.start}
                          onChange={(e) => setNewProfessional({
                            ...newProfessional,
                            schedule: { ...newProfessional.schedule, start: e.target.value }
                          })}
                          required
                        />
                      </div>
                      <div className="col">
                        <label className="form-label">Fim do Expediente</label>
                        <input
                          type="time"
                          className="form-control"
                          value={newProfessional.schedule.end}
                          onChange={(e) => setNewProfessional({
                            ...newProfessional,
                            schedule: { ...newProfessional.schedule, end: e.target.value }
                          })}
                          required
                        />
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col">
                        <label className="form-label">Início do Intervalo</label>
                        <input
                          type="time"
                          className="form-control"
                          value={newProfessional.schedule.breakStart}
                          onChange={(e) => setNewProfessional({
                            ...newProfessional,
                            schedule: { ...newProfessional.schedule, breakStart: e.target.value }
                          })}
                          required
                        />
                      </div>
                      <div className="col">
                        <label className="form-label">Fim do Intervalo</label>
                        <input
                          type="time"
                          className="form-control"
                          value={newProfessional.schedule.breakEnd}
                          onChange={(e) => setNewProfessional({
                            ...newProfessional,
                            schedule: { ...newProfessional.schedule, breakEnd: e.target.value }
                          })}
                          required
                        />
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Cor no Calendário</label>
                      <input
                        type="color"
                        className="form-control form-control-color w-100"
                        value={newProfessional.color}
                        onChange={(e) => setNewProfessional({ ...newProfessional, color: e.target.value })}
                        title="Escolha uma cor"
                      />
                    </div>
                    <div className="modal-footer">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setShowProfessionalModal(false)}
                      >
                        Cancelar
                      </button>
                      <button type="submit" className="btn btn-info">
                        Salvar
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Cadastro de Produto */}
        {showProductModal && (
          <div className="modal fade show" style={{ display: 'block' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header bg-warning text-dark">
                  <h5 className="modal-title">
                    <i className="bi bi-box-seam me-2"></i>
                    {intl.formatMessage({ id: 'modal.product.title' })}
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => setShowProductModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <form onSubmit={(e) => { e.preventDefault(); handleAddProduct(); }}>
                    <div className="mb-3">
                      <label className="form-label">Nome do Produto</label>
                      <input
                        type="text"
                        className="form-control"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Marca</label>
                      <input
                        type="text"
                        className="form-control"
                        value={newProduct.brand}
                        onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                        required
                      />
                    </div>
                    <div className="row mb-3">
                      <div className="col">
                        <label className="form-label">Preço (R$)</label>
                        <input
                          type="number"
                          className="form-control"
                          value={newProduct.price}
                          onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })}
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>
                      <div className="col">
                        <label className="form-label">Estoque</label>
                        <input
                          type="number"
                          className="form-control"
                          value={newProduct.stock}
                          onChange={(e) => setNewProduct({ ...newProduct, stock: parseInt(e.target.value) })}
                          min="0"
                          required
                        />
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Categoria</label>
                      <select
                        className="form-select"
                        value={newProduct.category}
                        onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                        required
                      >
                        <option value="">Selecione uma categoria</option>
                        <option value="cabelo">Cabelo</option>
                        <option value="barba">Barba</option>
                        <option value="manicure">Manicure</option>
                        <option value="pedicure">Pedicure</option>
                        <option value="estetica">Estética</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Descrição</label>
                      <textarea
                        className="form-control"
                        value={newProduct.description}
                        onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                        rows="3"
                      ></textarea>
                    </div>
                    <div className="modal-footer">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setShowProductModal(false)}
                      >
                        Cancelar
                      </button>
                      <button type="submit" className="btn btn-warning">
                        Salvar
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </GoogleOAuthProvider>
      );
    }

    export default App;

// Funções auxiliares para o status
const getStatusColor = (status) => {
  switch (status) {
    case 'confirmado':
      return 'success';
    case 'pendente':
      return 'warning';
    case 'cancelado':
      return 'danger';
    default:
      return 'secondary';
  }
};

const getStatusText = (status) => {
  switch (status) {
    case 'confirmado':
      return 'Confirmado';
    case 'pendente':
      return 'Pendente';
    case 'cancelado':
      return 'Cancelado';
    default:
      return 'Não definido';
  }
};
