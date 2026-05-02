import { AlertTriangle, CheckCircle2, Clock3, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { getMaintenanceRequests, createMaintenanceRequest, updateMaintenanceStatus, getMaintenanceStats } from '../data/firebaseData';
import styles from './ReportIssuesPage.module.css';
import { useAuth } from '../auth/FirebaseAuthContext';

const statusLabel = {
  Open: 'pending',
  'In Progress': 'in progress',
  Resolved: 'completed',
};

function priorityClass(priority) {
  if (priority === 'high') return styles.high;
  if (priority === 'medium') return styles.medium;
  return styles.low;
}

function statusClass(status) {
  if (status === 'Open') return styles.pending;
  if (status === 'In Progress') return styles.inProgress;
  return styles.completed;
}

export function ReportIssuesPage() {
  const { user } = useAuth();
  const role = user?.role;
  const [loading, setLoading] = useState(true);
  const [issues, setIssues] = useState([]);
  const [stats, setStats] = useState({ open: 0, inProgress: 0, resolved: 0 });

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Loading data for user:', user?.email, 'role:', role);
        console.log('User-specific filtering: Normal users see only their data, admin sees all data');
        
        const [issuesData, statsData] = await Promise.all([
          getMaintenanceRequests(user?.email, role),
          getMaintenanceStats(user?.email, role)
        ]);
        
        console.log('Issues data received for user', user?.email, ':', issuesData);
        console.log('Each issue belongs to:', issuesData.map(i => i.reportedBy));
        console.log('Stats data received:', statsData);
        
        // Verify user-specific filtering
        if (role !== 'admin' && issuesData.length > 0) {
          const allBelongToUser = issuesData.every(issue => 
            issue.reportedBy?.toLowerCase().trim() === user?.email?.toLowerCase().trim()
          );
          console.log('All issues belong to current user?', allBelongToUser);
        }
        
        setIssues(issuesData);
        setStats(statsData);
      } catch (error) {
        console.error('Error loading maintenance data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, role]);

  const visibleIssues = role === 'admin' ? issues : issues.filter((i) => i.status !== 'Resolved');

  
  const [showReportForm, setShowReportForm] = useState(false);
  const [newIssue, setNewIssue] = useState({ title: '', unit: '', priority: 'medium', category: 'General' });

  const handleReportIssue = async () => {
    if (!newIssue.title.trim()) return;
    
    try {
      const cleanEmail = user?.email ? user.email.toLowerCase().trim() : user?.email;
      const issueData = {
        title: newIssue.title,
        unit: newIssue.unit || 'Your Unit',
        priority: newIssue.priority,
        status: 'Open',
        reportedBy: cleanEmail,
        category: newIssue.category,
        description: '',
      };
      
      console.log('Creating issue with data:', issueData);
      console.log('Original user email:', user?.email, 'Cleaned email:', cleanEmail);
      
      const result = await createMaintenanceRequest(issueData);
      console.log('Issue creation result:', result);
      if (result.ok) {
        // Reload data
        const [issuesData, statsData] = await Promise.all([
          getMaintenanceRequests(user?.email, role),
          getMaintenanceStats(user?.email, role)
        ]);
        setIssues(issuesData);
        setStats(statsData);
        setNewIssue({ title: '', unit: '', priority: 'medium', category: 'General' });
        setShowReportForm(false);
      } else {
        console.error('Failed to create issue:', result.error);
      }
    } catch (error) {
      console.error('Error creating issue:', error);
    }
  };

  const handleStatusUpdate = async (issueId, newStatus) => {
    try {
      const result = await updateMaintenanceStatus(issueId, newStatus);
      if (result.ok) {
        // Reload data to get updated stats
        const [issuesData, statsData] = await Promise.all([
          getMaintenanceRequests(user?.email, role),
          getMaintenanceStats(user?.email, role)
        ]);
        setIssues(issuesData);
        setStats(statsData);
      } else {
        console.error('Failed to update status:', result.error);
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  if (loading) {
    return <div className={styles.page}>Loading maintenance data...</div>;
  }

  return (
    <div className={styles.page}>
      {showReportForm && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Report New Issue</h3>
            <input
              placeholder="Issue title"
              value={newIssue.title}
              onChange={(e) => setNewIssue(prev => ({ ...prev, title: e.target.value }))}
            />
            <input
              placeholder="Unit/Location"
              value={newIssue.unit}
              onChange={(e) => setNewIssue(prev => ({ ...prev, unit: e.target.value }))}
            />
            <select
              value={newIssue.priority}
              onChange={(e) => setNewIssue(prev => ({ ...prev, priority: e.target.value }))}
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
            <select
              value={newIssue.category}
              onChange={(e) => setNewIssue(prev => ({ ...prev, category: e.target.value }))}
            >
              <option value="General">General</option>
              <option value="Plumbing">Plumbing</option>
              <option value="Electrical">Electrical</option>
              <option value="HVAC">HVAC</option>
            </select>
            <div className={styles.modalActions}>
              <Button onClick={handleReportIssue}>Submit</Button>
              <Button variant="ghost" onClick={() => setShowReportForm(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
      <div className={styles.headerRow}>
        <div>
          <div className={styles.h1}>{role === 'admin' ? 'Issue Management' : 'Issue Reporting'}</div>
          <div className={styles.sub}>
            {role === 'admin'
              ? 'Update status and resolve maintenance requests'
              : 'Report maintenance problems and track updates'}
          </div>
        </div>
        <Button className={styles.reportBtn} onClick={() => setShowReportForm(true)}>
          <Plus size={14} />
          <span>Report Issue</span>
        </Button>
      </div>

      
      <Card title={role === 'admin' ? 'All Issues' : 'Your Issues'} subtitle="Latest first">
        <div className={styles.issuesList}>
          {visibleIssues.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              <p>No issues found.</p>
              <p style={{ fontSize: '14px', marginTop: '10px' }}>
                {role === 'admin' 
                  ? 'No issues have been reported by any users yet.' 
                  : 'You haven\'t reported any issues yet. Click "Report Issue" to create one.'}
              </p>
            </div>
          ) : (
            visibleIssues.map((issue) => (
            <article key={issue.id} className={styles.issueCard}>
              <div className={styles.issueTop}>
                <div className={styles.issueTitleWrap}>
                  <div className={`${styles.dot} ${statusClass(issue.status)}`} aria-hidden="true" />
                  <h3 className={styles.issueTitle}>{issue.title}</h3>
                  <span className={`${styles.priorityPill} ${priorityClass(issue.priority)}`}>
                    {issue.priority}
                  </span>
                </div>
                {role === 'admin' ? (
                  <select
                    className={styles.adminSelect}
                    value={issue.status}
                    onChange={(e) => handleStatusUpdate(issue.id, e.target.value)}
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                ) : (
                  <span className={`${styles.statusPill} ${statusClass(issue.status)}`}>
                    {statusLabel[issue.status] ?? issue.status}
                  </span>
                )}
              </div>

              <div className={styles.meta}>
                <span className={styles.metaItem}>{issue.unit}</span>
                <span className={styles.metaSep}>•</span>
                <span className={styles.metaItem}>{issue.reported}</span>
                <span className={styles.metaSep}>•</span>
                <span className={styles.metaItem}>{issue.category}</span>
              </div>
            </article>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}

