import { useCallback, useMemo, useState } from 'react';
import { Breadcrumb } from '../../components/ui/breadcrumb.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs.jsx';
import { Accordion, AccordionItem } from '../../components/ui/accordion.jsx';
import { Input } from '../../components/ui/input.jsx';
import { Select } from '../../components/ui/select.jsx';
import { Switch } from '../../components/ui/switch.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import { Dialog, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog.jsx';
import { DataTable } from '../../components/admin/DataTable.jsx';
import { useToast } from '../../components/ui/toast.jsx';
import { runOcr, saveMenuItems } from '../../mocks/admin.js';
import { UploadCloud, FileImage, Settings } from 'lucide-react';

function AdminMenuOCR() {
  const [files, setFiles] = useState([]);
  const [results, setResults] = useState([]);
  const [activeFile, setActiveFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [pendingFiles, setPendingFiles] = useState(null);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [bulkCategory, setBulkCategory] = useState('');
  const [bulkVatIncluded, setBulkVatIncluded] = useState(true);
  const { toast } = useToast();

  const handleFilesSelected = useCallback(
    (incoming) => {
      const imageFiles = incoming.filter((file) => file.type.startsWith('image/'));
      if (imageFiles.length === 0) {
        toast({
          title: '이미지를 선택해주세요',
          description: 'JPG, PNG 등 이미지 파일만 지원합니다.',
          variant: 'destructive',
        });
        return;
      }
      if (isDirty && results.length > 0) {
        setPendingFiles(imageFiles);
        setShowUnsavedDialog(true);
        return;
      }
      setFiles(imageFiles);
      setResults([]);
      setActiveFile(null);
      setIsDirty(false);
      toast({
        title: `${imageFiles.length}개의 파일이 선택되었습니다`,
        description: 'OCR 실행을 눌러 메뉴를 추출하세요.',
      });
    },
    [isDirty, results.length, toast]
  );

  const handleFileInput = (event) => {
    const fileArray = Array.from(event.target.files ?? []);
    handleFilesSelected(fileArray);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const droppedFiles = Array.from(event.dataTransfer.files ?? []);
    handleFilesSelected(droppedFiles);
  };

  const runOcrProcess = async () => {
    if (files.length === 0) {
      toast({
        title: '파일이 없습니다',
        description: '먼저 이미지를 업로드해주세요.',
        variant: 'destructive',
      });
      return;
    }
    setProcessing(true);
    try {
      const response = await runOcr(files);
      setResults(response);
      setActiveFile(response[0]?.fileName ?? null);
      setIsDirty(true);
      toast({
        title: 'OCR 완료',
        description: '인식된 메뉴를 검수해주세요.',
      });
    } catch (error) {
      toast({
        title: 'OCR 실패',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleFieldChange = (fileName, itemId, field, value) => {
    setResults((prev) =>
      prev.map((file) =>
        file.fileName === fileName
          ? {
              ...file,
              items: file.items.map((item) =>
                item.id === itemId ? { ...item, [field]: value } : item
              ),
            }
          : file
      )
    );
    setIsDirty(true);
  };

  const applyBulkChanges = () => {
    setResults((prev) =>
      prev.map((file) => ({
        ...file,
        items: file.items.map((item) => ({
          ...item,
          category: bulkCategory || item.category,
          vatIncluded: bulkVatIncluded,
        })),
      }))
    );
    setIsDirty(true);
    toast({
      title: '일괄 적용 완료',
      description: '모든 항목에 변경 사항이 반영되었습니다.',
    });
  };

  const handleSaveAll = async () => {
    if (results.length === 0) {
      toast({
        title: '저장할 데이터가 없습니다',
        description: 'OCR 결과를 먼저 생성해주세요.',
        variant: 'destructive',
      });
      return;
    }
    setProcessing(true);
    try {
      const response = await saveMenuItems(results);
      toast({
        title: '저장 완료',
        description: `${response.count}개 메뉴가 저장되었습니다.`,
      });
      setIsDirty(false);
    } catch (error) {
      toast({
        title: '저장 실패',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const confirmDiscardChanges = () => {
    if (pendingFiles) {
      setFiles(pendingFiles);
      setResults([]);
      setActiveFile(null);
      setIsDirty(false);
      setPendingFiles(null);
    }
    setShowUnsavedDialog(false);
  };

  const cancelDiscard = () => {
    setPendingFiles(null);
    setShowUnsavedDialog(false);
  };

  const currentItems = useMemo(() => {
    if (!activeFile) return [];
    return results.find((file) => file.fileName === activeFile)?.items ?? [];
  }, [activeFile, results]);

  const columns = useMemo(
    () => [
      {
        key: 'name',
        header: '메뉴명',
        render: (row) => (
          <Input
            value={row.name}
            onChange={(event) => handleFieldChange(activeFile, row.id, 'name', event.target.value)}
          />
        ),
      },
      {
        key: 'price',
        header: '가격',
        render: (row) => (
          <Input
            type="number"
            value={row.price}
            onChange={(event) =>
              handleFieldChange(activeFile, row.id, 'price', Number(event.target.value))
            }
          />
        ),
      },
      {
        key: 'category',
        header: '분류',
        render: (row) => (
          <Input
            value={row.category}
            onChange={(event) =>
              handleFieldChange(activeFile, row.id, 'category', event.target.value)
            }
          />
        ),
      },
      {
        key: 'vatIncluded',
        header: '부가세 포함',
        render: (row) => (
          <div className="flex items-center gap-2">
            <Switch
              checked={row.vatIncluded}
              onChange={(checked) => handleFieldChange(activeFile, row.id, 'vatIncluded', checked)}
            />
            <span className="text-xs text-slate-500">{row.vatIncluded ? '포함' : '미포함'}</span>
          </div>
        ),
      },
      {
        key: 'options',
        header: '옵션',
        render: (row) => (
          <Input
            value={row.options}
            onChange={(event) =>
              handleFieldChange(activeFile, row.id, 'options', event.target.value)
            }
          />
        ),
      },
    ],
    [activeFile]
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <h1 className="text-xl font-semibold text-[#0066CC]">올사람 관리자</h1>
          <Breadcrumb
            items={[
              { label: 'Admin', href: '/admin' },
              { label: '메뉴판 OCR' },
            ]}
          />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div
          className="mb-6"
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleDrop}
        >
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center gap-4 py-10 text-center text-slate-600">
              <UploadCloud className="h-12 w-12 text-[#0066CC]" />
              <div>
                <p className="text-lg font-semibold text-slate-800">이미지를 업로드해주세요</p>
                <p className="text-sm text-slate-500">
                  드래그 앤 드롭하거나 아래 버튼으로 파일을 선택하세요.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <input
                  id="ocr-file-input"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileInput}
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('ocr-file-input')?.click()}
                >
                  파일 선택
                </Button>
                <Button onClick={runOcrProcess} disabled={processing}>
                  {processing ? '처리 중...' : 'OCR 실행'}
                </Button>
              </div>
              {files.length > 0 && (
                <div className="flex max-w-md flex-wrap justify-center gap-2">
                  {files.map((file) => (
                    <Badge key={file.name} variant="secondary" className="bg-slate-100 text-slate-700">
                      {file.name}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {results.length > 0 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>일괄 수정</CardTitle>
                <p className="text-sm text-slate-500">
                  분류와 부가세 포함 여부를 일괄 변경하면 모든 항목에 적용됩니다.
                </p>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 md:flex-row md:items-end">
                <div className="flex-1 space-y-1">
                  <label className="text-sm font-medium text-slate-700">분류</label>
                  <Select value={bulkCategory} onChange={(event) => setBulkCategory(event.target.value)}>
                    <option value="">선택 안 함</option>
                    <option value="메인">메인</option>
                    <option value="사이드">사이드</option>
                    <option value="음료">음료</option>
                    <option value="중식">중식</option>
                  </Select>
                </div>
                <div className="flex items-center gap-3">
                  <Switch checked={bulkVatIncluded} onChange={(checked) => setBulkVatIncluded(checked)} />
                  <span className="text-sm text-slate-600">
                    부가세 {bulkVatIncluded ? '포함' : '미포함'}
                  </span>
                </div>
                <Button variant="outline" onClick={applyBulkChanges}>
                  <Settings className="mr-2 h-4 w-4" />
                  일괄 적용
                </Button>
                <Button onClick={handleSaveAll} disabled={processing}>
                  모두 저장
                </Button>
              </CardContent>
            </Card>

            <Tabs value={activeFile ?? results[0]?.fileName} onValueChange={setActiveFile}>
              <TabsList className="mb-4">
                {results.map((file) => (
                  <TabsTrigger key={file.fileName} value={file.fileName}>
                    {file.fileName}
                  </TabsTrigger>
                ))}
              </TabsList>

              {results.map((file) => (
                <TabsContent key={file.fileName} value={file.fileName}>
                  <Accordion>
                    <AccordionItem title="추출된 항목" defaultOpen>
                      <div className="mb-4 flex items-center gap-2 text-sm text-slate-600">
                        <FileImage className="h-4 w-4 text-[#0066CC]" />
                        {file.fileName} · {file.items.length}개 항목 추출
                      </div>
                      <DataTable columns={columns} data={currentItems} />
                    </AccordionItem>
                  </Accordion>
                </TabsContent>
              ))}
            </Tabs>

            <Card>
              <CardContent className="flex justify-end">
                <Button onClick={handleSaveAll} disabled={processing || !isDirty}>
                  {processing ? '저장 중...' : '모두 저장'}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      <Dialog open={showUnsavedDialog} onClose={cancelDiscard}>
        <DialogHeader>
          <DialogTitle>저장되지 않은 변경 사항이 있습니다</DialogTitle>
          <DialogDescription>
            새로운 파일을 업로드하면 현재 수정 중인 내용이 사라집니다. 계속하시겠습니까?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={cancelDiscard}>
            취소
          </Button>
          <Button variant="destructive" onClick={confirmDiscardChanges}>
            계속
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

export default AdminMenuOCR;
