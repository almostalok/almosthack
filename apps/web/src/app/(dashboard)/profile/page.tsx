'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { apiClient } from '@/lib/api-client';
import { UserProfile } from '@almosthack/types';
import { updateProfileSchema } from '@almosthack/validation';
import {
  User as UserIcon,
  GraduationCap,
  Code,
  Github,
  Linkedin,
  Globe,
  Edit2,
  Save,
  X,
  Plus,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';

export default function ProfilePage() {
  const { user: authUser, refreshSession } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    name: string;
    avatarUrl: string;
    bio: string;
    college: string;
    branch: string;
    graduationYear: string;
    skills: string[];
    githubUsername: string;
    linkedinUrl: string;
    portfolioUrl: string;
  }>({
    name: '',
    avatarUrl: '',
    bio: '',
    college: '',
    branch: '',
    graduationYear: '',
    skills: [],
    githubUsername: '',
    linkedinUrl: '',
    portfolioUrl: '',
  });

  const [newSkillInput, setNewSkillInput] = useState<string>('');

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await apiClient.get<UserProfile>('/users/me');
      setProfile(data);
      populateForm(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to fetch user profile.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const populateForm = (data: UserProfile) => {
    setFormData({
      name: data.name || '',
      avatarUrl: data.avatarUrl || '',
      bio: data.bio || '',
      college: data.college || '',
      branch: data.branch || '',
      graduationYear: data.graduationYear ? String(data.graduationYear) : '',
      skills: Array.isArray(data.skills) ? [...data.skills] : [],
      githubUsername: data.githubUsername || '',
      linkedinUrl: data.linkedinUrl || '',
      portfolioUrl: data.portfolioUrl || '',
    });
  };

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errorMsg) setErrorMsg(null);
  };

  const handleAddSkill = () => {
    const trimmed = newSkillInput.trim();
    if (!trimmed) return;
    if (formData.skills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      setErrorMsg(`Skill "${trimmed}" already added.`);
      return;
    }
    if (formData.skills.length >= 30) {
      setErrorMsg('Maximum limit of 30 skills reached.');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      skills: [...prev.skills, trimmed],
    }));
    setNewSkillInput('');
    setErrorMsg(null);
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove),
    }));
  };

  const handleCancelEdit = () => {
    if (profile) populateForm(profile);
    setIsEditing(false);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Prepare payload
    const payload: Record<string, any> = {};

    if (formData.name.trim() !== (profile?.name || '')) {
      payload.name = formData.name.trim();
    }
    if (formData.avatarUrl.trim() !== (profile?.avatarUrl || '')) {
      payload.avatarUrl = formData.avatarUrl.trim() || null;
    }
    if (formData.bio.trim() !== (profile?.bio || '')) {
      payload.bio = formData.bio.trim() || null;
    }
    if (formData.college.trim() !== (profile?.college || '')) {
      payload.college = formData.college.trim() || null;
    }
    if (formData.branch.trim() !== (profile?.branch || '')) {
      payload.branch = formData.branch.trim() || null;
    }

    const parsedYear = formData.graduationYear.trim() ? parseInt(formData.graduationYear.trim(), 10) : null;
    if (parsedYear !== (profile?.graduationYear || null)) {
      payload.graduationYear = parsedYear;
    }

    if (JSON.stringify(formData.skills) !== JSON.stringify(profile?.skills || [])) {
      payload.skills = formData.skills;
    }

    if (formData.githubUsername.trim() !== (profile?.githubUsername || '')) {
      payload.githubUsername = formData.githubUsername.trim() || null;
    }
    if (formData.linkedinUrl.trim() !== (profile?.linkedinUrl || '')) {
      payload.linkedinUrl = formData.linkedinUrl.trim() || null;
    }
    if (formData.portfolioUrl.trim() !== (profile?.portfolioUrl || '')) {
      payload.portfolioUrl = formData.portfolioUrl.trim() || null;
    }

    if (Object.keys(payload).length === 0) {
      setIsEditing(false);
      setSuccessMsg('No changes were made.');
      return;
    }

    // Client-side Zod validation check
    const validationResult = updateProfileSchema.safeParse(payload);
    if (!validationResult.success) {
      const firstIssue = validationResult.error.issues[0];
      setErrorMsg(firstIssue ? firstIssue.message : 'Validation failed.');
      return;
    }

    setIsSaving(true);
    try {
      const updated = await apiClient.patch<UserProfile>('/users/me', payload);
      setProfile(updated);
      populateForm(updated);
      setIsEditing(false);
      setSuccessMsg('Profile updated successfully!');
      await refreshSession();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 w-full items-center justify-center font-mono text-xs text-zinc-400">
        <Loader2 className="mr-2 h-4 w-4 animate-spin text-emerald-500" />
        Hydrating user profile identity...
      </div>
    );
  }

  const userInitials = profile?.name
    ? profile.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'AH';

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-mono select-none">
      {/* Notifications */}
      {successMsg && (
        <div className="flex items-center justify-between p-3.5 bg-emerald-950/40 border border-emerald-500/30 rounded-lg text-emerald-400 text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="hover:text-emerald-200">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center justify-between p-3.5 bg-rose-950/40 border border-rose-500/30 rounded-lg text-rose-400 text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="hover:text-rose-200">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Profile Header Card */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Avatar container */}
            <div className="relative group">
              {profile?.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.name}
                  className="w-20 h-20 rounded-full object-cover border-2 border-zinc-700 bg-zinc-900"
                  onError={(e) => {
                    // Fallback on broken image link
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : null}
              {(!profile?.avatarUrl || false) && (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-600 to-teal-800 border-2 border-zinc-700 flex items-center justify-center font-heading text-xl font-bold text-black shadow-inner">
                  {userInitials}
                </div>
              )}
            </div>

            {/* Name, email, roles */}
            <div className="space-y-1">
              <h1 className="text-xl font-bold text-zinc-100 font-sans tracking-tight">
                {profile?.name}
              </h1>
              <p className="text-xs text-zinc-400 font-mono">{profile?.email}</p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {(profile?.roles || ['PARTICIPANT']).map((role) => (
                  <span
                    key={role}
                    className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Edit / Cancel Toggle Action */}
          <div>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 hover:text-white rounded-lg text-xs font-medium transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5 text-emerald-400" />
                Edit Profile
              </button>
            ) : (
              <button
                onClick={handleCancelEdit}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-zinc-200 rounded-lg text-xs font-medium transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Profile Form / Content Grid */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Core & Avatar Edit Section */}
        {isEditing && (
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2 border-b border-zinc-900 pb-3">
              <UserIcon className="w-4 h-4 text-emerald-400" /> Identity Settings
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-zinc-400 text-[11px]">Full Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-100 focus:outline-none focus:border-emerald-500/50"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-zinc-400 text-[11px]">Avatar URL (HTTPS)</label>
                <input
                  type="url"
                  value={formData.avatarUrl}
                  onChange={(e) => handleInputChange('avatarUrl', e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-100 focus:outline-none focus:border-emerald-500/50"
                />
              </div>
            </div>
          </div>
        )}

        {/* About / Bio Section */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2 border-b border-zinc-900 pb-3">
            <UserIcon className="w-4 h-4 text-emerald-400" /> About Participant
          </h2>
          {isEditing ? (
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] text-zinc-400">
                <label>Biography</label>
                <span>{formData.bio.length} / 500</span>
              </div>
              <textarea
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                maxLength={500}
                rows={3}
                placeholder="Tell the hackathon community about your background and interests..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded p-3 text-zinc-100 text-xs focus:outline-none focus:border-emerald-500/50 resize-none"
              />
            </div>
          ) : (
            <p className="text-xs text-zinc-300 leading-relaxed font-sans">
              {profile?.bio || (
                <span className="italic text-zinc-600">No biography provided yet.</span>
              )}
            </p>
          )}
        </div>

        {/* Education Section */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2 border-b border-zinc-900 pb-3">
            <GraduationCap className="w-4 h-4 text-emerald-400" /> Academic & Education
          </h2>
          {isEditing ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-zinc-400 text-[11px]">College / University</label>
                <input
                  type="text"
                  value={formData.college}
                  onChange={(e) => handleInputChange('college', e.target.value)}
                  placeholder="e.g. Stanford University"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-100 focus:outline-none focus:border-emerald-500/50"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-zinc-400 text-[11px]">Branch / Specialization</label>
                <input
                  type="text"
                  value={formData.branch}
                  onChange={(e) => handleInputChange('branch', e.target.value)}
                  placeholder="e.g. Computer Science"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-100 focus:outline-none focus:border-emerald-500/50"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-zinc-400 text-[11px]">Graduation Year</label>
                <input
                  type="number"
                  value={formData.graduationYear}
                  onChange={(e) => handleInputChange('graduationYear', e.target.value)}
                  placeholder="e.g. 2026"
                  min={1950}
                  max={2100}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-100 focus:outline-none focus:border-emerald-500/50"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-[10px] text-zinc-500 block uppercase">College</span>
                <span className="text-zinc-200">{profile?.college || 'Not specified'}</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 block uppercase">Branch</span>
                <span className="text-zinc-200">{profile?.branch || 'Not specified'}</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 block uppercase">Graduation Year</span>
                <span className="text-zinc-200">
                  {profile?.graduationYear ? profile.graduationYear : 'Not specified'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Developer Profile Section */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2 border-b border-zinc-900 pb-3">
            <Code className="w-4 h-4 text-emerald-400" /> Developer Profile & Skills
          </h2>

          {/* Skills Display / Input */}
          <div className="space-y-2">
            <span className="text-[10px] text-zinc-500 uppercase block font-semibold">Technical Skills</span>
            {isEditing ? (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSkillInput}
                    onChange={(e) => setNewSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkill();
                      }
                    }}
                    placeholder="Add a skill (e.g. React, NestJS, Go)..."
                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded px-3 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500/50"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded text-xs flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 text-emerald-400" /> Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {formData.skills.map((skill) => (
                    <span
                      key={skill}
                      className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-900 border border-zinc-700/80 rounded-md text-xs text-zinc-200"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-zinc-500 hover:text-rose-400 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {formData.skills.length === 0 && (
                    <span className="text-xs text-zinc-600 italic">No skills added yet.</span>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {profile?.skills && profile.skills.length > 0 ? (
                  profile.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded-md text-xs text-emerald-400 font-mono"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-zinc-600 italic">No skills specified.</span>
                )}
              </div>
            )}
          </div>

          {/* Social Links & GitHub Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-3 border-t border-zinc-900">
            {/* GitHub Username */}
            <div className="space-y-1">
              <span className="text-[10px] text-zinc-500 uppercase flex items-center gap-1">
                <Github className="w-3 h-3 text-zinc-400" /> GitHub Handle (Metadata)
              </span>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.githubUsername}
                  onChange={(e) => handleInputChange('githubUsername', e.target.value)}
                  placeholder="octocat"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-1.5 text-zinc-100 focus:outline-none focus:border-emerald-500/50"
                />
              ) : profile?.githubUsername ? (
                <a
                  href={`https://github.com/${profile.githubUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:underline flex items-center gap-1 font-mono"
                >
                  @{profile.githubUsername}
                </a>
              ) : (
                <span className="text-zinc-600 italic">Not set</span>
              )}
            </div>

            {/* LinkedIn URL */}
            <div className="space-y-1">
              <span className="text-[10px] text-zinc-500 uppercase flex items-center gap-1">
                <Linkedin className="w-3 h-3 text-sky-400" /> LinkedIn Profile
              </span>
              {isEditing ? (
                <input
                  type="url"
                  value={formData.linkedinUrl}
                  onChange={(e) => handleInputChange('linkedinUrl', e.target.value)}
                  placeholder="https://linkedin.com/in/..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-1.5 text-zinc-100 focus:outline-none focus:border-emerald-500/50"
                />
              ) : profile?.linkedinUrl ? (
                <a
                  href={profile.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-400 hover:underline flex items-center gap-1 truncate font-mono"
                >
                  LinkedIn <Globe className="w-3 h-3" />
                </a>
              ) : (
                <span className="text-zinc-600 italic">Not set</span>
              )}
            </div>

            {/* Portfolio URL */}
            <div className="space-y-1">
              <span className="text-[10px] text-zinc-500 uppercase flex items-center gap-1">
                <Globe className="w-3 h-3 text-emerald-400" /> Portfolio Website
              </span>
              {isEditing ? (
                <input
                  type="url"
                  value={formData.portfolioUrl}
                  onChange={(e) => handleInputChange('portfolioUrl', e.target.value)}
                  placeholder="https://yourwebsite.com"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-1.5 text-zinc-100 focus:outline-none focus:border-emerald-500/50"
                />
              ) : profile?.portfolioUrl ? (
                <a
                  href={profile.portfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:underline flex items-center gap-1 truncate font-mono"
                >
                  {profile.portfolioUrl.replace(/^https?:\/\//, '')}
                </a>
              ) : (
                <span className="text-zinc-600 italic">Not set</span>
              )}
            </div>
          </div>
        </div>

        {/* Save Form Actions */}
        {isEditing && (
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleCancelEdit}
              disabled={isSaving}
              className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-lg text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-lg text-xs transition-colors disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" /> Save Changes
                </>
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
