/**
 * GET  /api/admin/cache          → lista estado de todos os caches
 * POST /api/admin/cache          → força actualização de uma entrada
 * DELETE /api/admin/cache?key=.. → remove uma entrada de cache
 *
 * Requer: Clerk session com admin uid/email
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-server';
import { getKV } from '@/lib/db';
import {
  getAllCacheStatuses,
  forceRefresh,
  type DataType,
} from '@/lib/data-cache';

// Importa os fetchers e fallbacks para cada tipo de dado
import {
  fetchContratosByMunicipio,
  fetchCriminalityByRegion,
  fetchHealthByArs,
  getFallbackContratos,
} from '@/lib/municipios-api';
import {
  fetchDeputados,
  fetchIniciativas,
  getFallbackDeputados,
  getFallbackIniciativas,
} from '@/lib/parlamento-api';

export async function GET(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const statuses = await getAllCacheStatuses();
    return NextResponse.json({ statuses });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// ─── POST: forçar actualização ────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const { dataType, options = {} } = body as {
    dataType: DataType;
    options?: { localidade?: string; nuts?: string; ars?: string; legislatura?: string };
  };

  if (!dataType) {
    return NextResponse.json({ error: 'dataType is required' }, { status: 400 });
  }

  try {
    let result: { data: unknown; status: string };

    switch (dataType) {
      case 'contratos': {
        const localidade = options.localidade ?? 'Lisboa';
        result = await forceRefresh(
          `contratos-${localidade.toLowerCase().replace(/\s+/g, '-')}-all-p0`,
          'contratos',
          'https://www.base.gov.pt/Base4/rest/contratos',
          () => fetchContratosByMunicipio(localidade),
          () => getFallbackContratos(localidade),
        );
        break;
      }
      case 'criminalidade': {
        result = await forceRefresh(
          `criminalidade-all`,
          'criminalidade',
          'https://dados.gov.pt/api/1/datasets/?q=criminalidade',
          () => fetchCriminalityByRegion(undefined),
          () => fetchCriminalityByRegion(undefined),
        );
        break;
      }
      case 'saude': {
        result = await forceRefresh(
          `saude-all`,
          'saude',
          'https://transparencia.sns.gov.pt/explore/dataset/monitorizacao-sazonal-csh/download',
          () => fetchHealthByArs(undefined, 80),
          () => fetchHealthByArs(undefined, 80),
        );
        break;
      }
      case 'deputados': {
        const legislatura = options.legislatura ?? 'XVI';
        result = await forceRefresh(
          `deputados-${legislatura}`,
          'deputados',
          'https://www.parlamento.pt/Cidadania/Pages/DadosAbertos.aspx',
          () => fetchDeputados(legislatura),
          getFallbackDeputados,
        );
        break;
      }
      case 'iniciativas': {
        const legislatura = options.legislatura ?? 'XVI';
        result = await forceRefresh(
          `iniciativas-${legislatura}`,
          'iniciativas',
          'https://www.parlamento.pt/Cidadania/Pages/DadosAbertos.aspx',
          () => fetchIniciativas(legislatura, 50),
          getFallbackIniciativas,
        );
        break;
      }
      default:
        return NextResponse.json({ error: `Unknown dataType: ${dataType}` }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      dataType,
      status: result.status,
      refreshedAt: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// ─── DELETE: remover entrada de cache ────────────────────────────────────────

export async function DELETE(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const key = new URL(request.url).searchParams.get('key');
  if (!key) return NextResponse.json({ error: 'key is required' }, { status: 400 });

  try {
    await getKV().delete('cache:' + key);
    return NextResponse.json({ success: true, deleted: key });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
