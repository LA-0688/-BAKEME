import { NextResponse } from 'next/server';
import { generateText, tool } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';

// Mock Databases for MVP
const inventoryDb: Record<string, number> = {
  'Sourdough Loaf': 20,
  'Croissant': 50,
  'Baguette': 30,
};

const crmDb: any[] = [];
const internalLogs: any[] = [];

function logAction(agent: string, action: string, details: any) {
  const logEntry = { timestamp: new Date().toISOString(), agent, action, details };
  internalLogs.push(logEntry);
  console.log(`[${agent}] ${action}:`, details);
}

// ---------------------------------------------------------------------------
// 1. Admin Head Agent Workflow
// ---------------------------------------------------------------------------
async function runAdminAgent(orderData: any) {
  logAction('Admin Head Agent', 'Received Order', orderData.orderId);

  try {
    const { text, toolCalls } = await generateText({
      model: google('gemini-1.5-pro'),
      system: 'You are the Admin Head Agent of L\'Artisan Bakery. Your job is to process new orders by checking inventory, scheduling the bake, and contacting suppliers if needed. Use the provided tools to execute these sub-tasks.',
      prompt: `Process this new order: ${JSON.stringify(orderData, null, 2)}`,
      tools: {
        updateInventory: tool({
          description: 'Deduct ingredients/items from inventory. Use this to update the virtual stock.',
          parameters: z.object({
            itemsToDeduct: z.array(z.object({ itemName: z.string(), quantity: z.number() })),
          }),
          execute: async ({ itemsToDeduct }) => {
            logAction('Inventory Manager (Sub-Agent)', 'Updating Stock', itemsToDeduct);
            itemsToDeduct.forEach(item => {
              if (inventoryDb[item.itemName]) {
                inventoryDb[item.itemName] -= item.quantity;
              }
            });
            return { success: true, currentStock: inventoryDb };
          },
        }),
        scheduleBake: tool({
          description: 'Schedule the kitchen prep time required for the order.',
          parameters: z.object({
            orderId: z.string(),
            estimatedPrepTimeMinutes: z.number(),
            ovenAssignment: z.string(),
          }),
          execute: async (args) => {
            logAction('Bake Scheduler (Sub-Agent)', 'Scheduling Kitchen Time', args);
            return { success: true, status: 'Scheduled' };
          },
        }),
        contactSupplier: tool({
          description: 'Draft an email to the supplier if an ingredient is running low (e.g., Croissants < 10).',
          parameters: z.object({
            ingredient: z.string(),
            supplierEmail: z.string(),
            messageDraft: z.string(),
          }),
          execute: async (args) => {
            logAction('Supplier Agent (Sub-Agent)', 'Drafting Restock Email', args);
            return { success: true, status: 'Drafted' };
          },
        }),
      },
      maxSteps: 5,
    });

    logAction('Admin Head Agent', 'Completed Tasks', text);
  } catch (err: any) {
    console.error('Admin Agent Error:', err);
  }
}

// ---------------------------------------------------------------------------
// 2. Customer Service Head Agent Workflow
// ---------------------------------------------------------------------------
async function runCustomerAgent(orderData: any) {
  logAction('Customer Service Head Agent', 'Received Order', orderData.orderId);

  try {
    const { text, toolCalls } = await generateText({
      model: google('gemini-1.5-pro'),
      system: 'You are the Customer Service Head Agent of L\'Artisan Bakery. Your job is to ensure the customer is happy. Use your tools to draft a personalized thank you message, update their CRM profile, and award loyalty points.',
      prompt: `Handle the customer service for this order: ${JSON.stringify(orderData, null, 2)}`,
      tools: {
        draftMessage: tool({
          description: 'Draft a warm, personalized email or SMS to the customer acknowledging the specific artisanal goods they bought.',
          parameters: z.object({
            customerName: z.string(),
            messageBody: z.string(),
            channel: z.enum(['SMS', 'EMAIL']),
          }),
          execute: async (args) => {
            logAction('Comms Agent (Sub-Agent)', `Drafting ${args.channel}`, args.messageBody);
            return { success: true, sent: false };
          },
        }),
        updateCRM: tool({
          description: 'Update the customer database with their latest purchase.',
          parameters: z.object({
            customerPhone: z.string(),
            totalSpent: z.number(),
            itemsBought: z.array(z.string()),
          }),
          execute: async (args) => {
            logAction('CRM Updater (Sub-Agent)', 'Updating Profile', args);
            crmDb.push(args);
            return { success: true };
          },
        }),
        awardLoyalty: tool({
          description: 'Calculate and award loyalty Crust Points (1 point per 10 INR spent).',
          parameters: z.object({
            customerPhone: z.string(),
            pointsToAward: z.number(),
          }),
          execute: async (args) => {
            logAction('Loyalty Agent (Sub-Agent)', 'Awarding Crust Points', args);
            return { success: true, pointsAwarded: args.pointsToAward };
          },
        }),
      },
      maxSteps: 5,
    });

    logAction('Customer Service Head Agent', 'Completed Tasks', text);
  } catch (err: any) {
    console.error('Customer Agent Error:', err);
  }
}

export async function POST(req: Request) {
  try {
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      console.warn('GOOGLE_GENERATIVE_AI_API_KEY is not set. Agents will not run.');
      return NextResponse.json({ success: true, warning: 'API key missing, mock mode only.' });
    }

    const orderData = await req.json();
    
    // We do NOT await these. The endpoint should respond immediately to the checkout client.
    // The agents run asynchronously in the background.
    runAdminAgent(orderData).catch(console.error);
    runCustomerAgent(orderData).catch(console.error);

    return NextResponse.json({ 
      success: true, 
      message: 'Order handed off to AI Orchestrator' 
    });
  } catch (error: any) {
    console.error('Orchestrator API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  // A simple endpoint to fetch logs for the Admin Dashboard
  return NextResponse.json({ logs: internalLogs, inventory: inventoryDb, crm: crmDb });
}
