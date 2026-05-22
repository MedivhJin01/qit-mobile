import { BASE_URL } from '../constants/api';

export async function updateUsername(username: string, token: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/users/profile/username`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(username),
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => 'Failed to update username');
    throw new Error(msg);
  }
}

export async function getUploadUrl(token: string): Promise<{ presignedUrl: string; fileUrl: string }> {
  const res = await fetch(`${BASE_URL}/api/users/profile/upload-url`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to get upload URL');
  return res.json();
}

export async function uploadToS3(presignedUrl: string, imageUri: string): Promise<void> {
  const blob = await (await fetch(imageUri)).blob();
  const res = await fetch(presignedUrl, {
    method: 'PUT',
    headers: { 'Content-Type': 'image/jpeg' },
    body: blob,
  });
  if (!res.ok) throw new Error('Failed to upload image');
}

export async function updateProfilePic(fileUrl: string, token: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/users/profile/pic`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(fileUrl),
  });
  if (!res.ok) throw new Error('Failed to update profile picture');
}

export async function deleteProfilePic(token: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/users/profile/pic`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to delete profile picture');
}
