import { useEffect, useState } from 'react';
import { X, Clock, User, Info } from 'lucide-react';
import { adminService } from '@/services/api';
import { toast } from 'sonner';

export function ActivityLogsModal({ bookId, bookTitle, onClose }: { bookId: string, bookTitle: string, onClose: () => void }) {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getBookLogs(bookId)
      .then(res => setLogs(res.data))
      .catch(() => toast.error('Failed to load activity logs'))
      .finally(() => setLoading(false));
  }, [bookId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Activity Logs</h2>
            <p className="text-sm text-slate-500 mt-1">Audit trail for: <span className="font-medium text-slate-900">{bookTitle}</span></p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-slate-900">No recent activity</h3>
              <p className="text-slate-500">There are no tracked changes for this book yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => (
                <div key={log.id} className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-md ${
                        log.action === 'CREATE' ? 'bg-emerald-100 text-emerald-700' :
                        log.action === 'UPDATE' ? 'bg-blue-100 text-blue-700' :
                        log.action === 'DELETE' ? 'bg-rose-100 text-rose-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {log.action}
                      </span>
                      <span className="text-sm text-slate-500 flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-2 text-sm text-slate-700 whitespace-pre-wrap">
                    {log.details || 'No details provided'}
                  </div>

                  <div className="mt-3 flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5" />
                      {log.user ? `${log.user.name} (${log.user.email})` : 'System / Guest'}
                      {log.user?.role && <span className="ml-1 px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">{log.user.role}</span>}
                    </div>
                    {log.ipAddress && (
                      <div className="flex items-center gap-1" title="IP Address">
                        <Info className="h-3.5 w-3.5" />
                        {log.ipAddress}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
