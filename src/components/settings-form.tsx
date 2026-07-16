'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, CheckCircle2, ExternalLink } from 'lucide-react'

import {
  queryNotionDatabases,
  saveNotionToken,
  testNotionConnection,
} from '@/lib/actions/notion'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

/** Notion 데이터베이스 검색 결과 항목 (드롭다운 옵션) */
type NotionDatabaseOption = {
  id: string
  title: string
}

/** 연동 테스트/저장 결과에 따른 상태 배너 표시 상태 */
type ConnectionStatus = 'idle' | 'success' | 'error'

/**
 * Notion 연동 설정 폼 (F006, F011)
 *
 * 간단한 2단계 폼이라 React Hook Form/Zod 대신 useState로 상태를 직접 관리합니다.
 * 1) Integration Token 입력 → "연동 테스트" → 접근 가능한 데이터베이스 목록 조회
 * 2) 견적서(Invoices)/품목(Items) 데이터베이스 선택 → "저장" → 성공 시 대시보드로 이동
 */
export function SettingsForm() {
  const router = useRouter()

  const [token, setToken] = useState('')
  const [isTesting, setIsTesting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [databaseList, setDatabaseList] = useState<NotionDatabaseOption[]>([])
  const [selectedInvoicesDb, setSelectedInvoicesDb] = useState('')
  const [selectedItemsDb, setSelectedItemsDb] = useState('')

  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>('idle')
  const [statusMessage, setStatusMessage] = useState('')

  const isBusy = isTesting || isSaving

  /** 토큰 입력 처리 - 토큰이 바뀌면 이전 테스트 결과(DB 목록/선택/상태)는 초기화합니다. */
  function handleTokenChange(event: React.ChangeEvent<HTMLInputElement>) {
    setToken(event.target.value)
    setDatabaseList([])
    setSelectedInvoicesDb('')
    setSelectedItemsDb('')
    setConnectionStatus('idle')
    setStatusMessage('')
  }

  /**
   * 연동 테스트 핸들러
   * testNotionConnection()으로 토큰 유효성을 먼저 확인한 뒤,
   * 유효한 경우에만 queryNotionDatabases()로 접근 가능한 DB 목록을 조회합니다.
   */
  async function handleTestConnection() {
    const trimmedToken = token.trim()
    if (!trimmedToken) {
      setConnectionStatus('error')
      setStatusMessage('Integration Token을 입력해 주세요.')
      return
    }

    setIsTesting(true)
    try {
      const testResult = await testNotionConnection(trimmedToken)

      if (!testResult.success) {
        setConnectionStatus('error')
        setStatusMessage(
          testResult.error?.message ?? '연동 테스트에 실패했습니다.'
        )
        return
      }

      if (!testResult.data) {
        setConnectionStatus('error')
        setStatusMessage(
          '유효하지 않은 Notion Integration Token입니다. 토큰을 다시 확인해 주세요.'
        )
        return
      }

      const databasesResult = await queryNotionDatabases(trimmedToken)
      if (!databasesResult.success || !databasesResult.data) {
        setConnectionStatus('error')
        setStatusMessage(
          databasesResult.error?.message ??
            '데이터베이스 목록을 불러오지 못했습니다.'
        )
        return
      }

      if (databasesResult.data.length === 0) {
        setConnectionStatus('error')
        setStatusMessage(
          '연결된 데이터베이스가 없습니다. Notion에서 Integration을 데이터베이스에 연결(Connect)한 뒤 다시 시도해 주세요.'
        )
        return
      }

      setDatabaseList(databasesResult.data)
      setSelectedInvoicesDb('')
      setSelectedItemsDb('')
      setConnectionStatus('success')
      setStatusMessage(
        'Notion 워크스페이스와 정상적으로 연결되었습니다. 견적서/품목 데이터베이스를 선택해 주세요.'
      )
    } catch (error) {
      console.error('Notion 연동 테스트 에러:', error)
      setConnectionStatus('error')
      setStatusMessage('예상치 못한 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setIsTesting(false)
    }
  }

  /**
   * 저장 핸들러
   * 입력 검증(DB 2개 선택 여부) 후 saveNotionToken()을 호출하고,
   * 성공 시 2초 뒤 대시보드로 이동합니다.
   */
  async function handleSave() {
    const trimmedToken = token.trim()
    if (!trimmedToken) {
      setConnectionStatus('error')
      setStatusMessage('Integration Token을 입력해 주세요.')
      return
    }
    if (!selectedInvoicesDb || !selectedItemsDb) {
      setConnectionStatus('error')
      setStatusMessage('견적서와 품목 데이터베이스를 모두 선택해 주세요.')
      return
    }
    if (selectedInvoicesDb === selectedItemsDb) {
      setConnectionStatus('error')
      setStatusMessage(
        '견적서와 품목 데이터베이스는 서로 다르게 선택해 주세요.'
      )
      return
    }

    setIsSaving(true)
    try {
      const result = await saveNotionToken(
        trimmedToken,
        selectedInvoicesDb,
        selectedItemsDb
      )

      if (!result.success) {
        setConnectionStatus('error')
        setStatusMessage(result.error?.message ?? '저장에 실패했습니다.')
        return
      }

      setConnectionStatus('success')
      setStatusMessage('Notion 연동이 저장되었습니다. 대시보드로 이동합니다...')
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    } catch (error) {
      console.error('Notion 연동 저장 에러:', error)
      setConnectionStatus('error')
      setStatusMessage('예상치 못한 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* 상태 메시지 영역 - 연동 테스트/저장 결과에 따라 조건부 렌더링 */}
      {connectionStatus === 'success' && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>연동 성공</AlertTitle>
          <AlertDescription>{statusMessage}</AlertDescription>
        </Alert>
      )}
      {connectionStatus === 'error' && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>연동 실패</AlertTitle>
          <AlertDescription>{statusMessage}</AlertDescription>
        </Alert>
      )}

      {/* 섹션 1: Notion Integration Token */}
      <Card>
        <CardHeader>
          <CardTitle>Notion Integration Token</CardTitle>
          <CardDescription>
            Notion에서 발급한 Integration Token을 입력하세요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="notion-token">Notion Integration Token</Label>
            {/* 복사/붙여넣기 편의를 위해 password가 아닌 일반 텍스트 타입 사용 */}
            <Input
              id="notion-token"
              name="notionToken"
              type="text"
              placeholder="secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              autoComplete="off"
              spellCheck={false}
              className="font-mono text-sm"
              value={token}
              onChange={handleTokenChange}
              disabled={isBusy}
            />
            <p className="text-muted-foreground text-sm">
              Notion에서 발급한 Integration Token을 입력하세요
            </p>
          </div>

          <Link
            href="https://www.notion.so/my-integrations"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary inline-flex items-center gap-1 text-sm underline-offset-4 hover:underline"
          >
            Notion Integration 생성하기
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </CardContent>
      </Card>

      {/* 섹션 2: DB 선택 */}
      <Card>
        <CardHeader>
          <CardTitle>결제 기본 DB 선택</CardTitle>
          <CardDescription>
            연동된 Notion 워크스페이스에서 사용할 데이터베이스를 선택하세요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Invoices DB 선택 */}
          <div className="space-y-2">
            <Label htmlFor="invoices-db">Invoices DB</Label>
            {isTesting ? (
              <Skeleton className="h-9 w-full rounded-md" />
            ) : (
              <Select
                value={selectedInvoicesDb}
                onValueChange={setSelectedInvoicesDb}
                disabled={isBusy || databaseList.length === 0}
              >
                <SelectTrigger id="invoices-db">
                  <SelectValue placeholder="연동 테스트 후 선택할 수 있습니다" />
                </SelectTrigger>
                <SelectContent>
                  {databaseList.map(database => (
                    <SelectItem key={database.id} value={database.id}>
                      {database.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Items DB 선택 */}
          <div className="space-y-2">
            <Label htmlFor="items-db">Items DB</Label>
            {isTesting ? (
              <Skeleton className="h-9 w-full rounded-md" />
            ) : (
              <Select
                value={selectedItemsDb}
                onValueChange={setSelectedItemsDb}
                disabled={isBusy || databaseList.length === 0}
              >
                <SelectTrigger id="items-db">
                  <SelectValue placeholder="연동 테스트 후 선택할 수 있습니다" />
                </SelectTrigger>
                <SelectContent>
                  {databaseList.map(database => (
                    <SelectItem key={database.id} value={database.id}>
                      {database.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 섹션 3: 액션 버튼 */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="outline" asChild>
          <Link href="/">취소</Link>
        </Button>

        <Button
          type="button"
          variant="secondary"
          onClick={handleTestConnection}
          disabled={isBusy || !token.trim()}
        >
          {isTesting ? '연동 테스트 중...' : '연동 테스트'}
        </Button>

        <Button
          type="button"
          onClick={handleSave}
          disabled={isBusy || !selectedInvoicesDb || !selectedItemsDb}
        >
          {isSaving ? '저장 중...' : '저장'}
        </Button>
      </div>
    </div>
  )
}
