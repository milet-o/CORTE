import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export interface BugReport {
  id: string;
  createdAt: string;
  reporter: string;
  description: string;
  context: string;
  resolved: boolean;
}

const BUGS_FILE = path.resolve(process.cwd(), 'data/bugs.json');

function readBugs(): BugReport[] {
  try {
    if (!fs.existsSync(BUGS_FILE)) {
      return [];
    }
    const data = fs.readFileSync(BUGS_FILE, 'utf-8');
    return JSON.parse(data) || [];
  } catch (e) {
    return [];
  }
}

function writeBugs(bugs: BugReport[]) {
  try {
    const dir = path.dirname(BUGS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(BUGS_FILE, JSON.stringify(bugs, null, 2), 'utf-8');
  } catch (e) {}
}

export async function GET() {
  const bugs = readBugs();
  // Mais recentes primeiro
  bugs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return NextResponse.json({ success: true, bugs });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { description, reporter, context } = body;

    if (!description || !description.trim()) {
      return NextResponse.json({ error: 'Descrição é obrigatória' }, { status: 400 });
    }

    const bugs = readBugs();
    const newBug: BugReport = {
      id: 'bug_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      createdAt: new Date().toISOString(),
      reporter: (reporter || 'Anônimo').trim().slice(0, 30),
      description: description.trim(),
      context: (context || 'Geral').trim().slice(0, 50),
      resolved: false,
    };

    bugs.unshift(newBug);
    writeBugs(bugs);

    return NextResponse.json({ success: true, bug: newBug });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erro ao registrar bug' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id é obrigatório' }, { status: 400 });
    }

    let bugs = readBugs();
    bugs = bugs.filter(b => b.id !== id);
    writeBugs(bugs);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erro ao deletar bug' }, { status: 500 });
  }
}
