'use client';
import { ResyncMirrorRequest } from '@/grpc_generated/route';
import { Button } from '@/lib/Button';
import { Dialog, DialogClose } from '@/lib/Dialog';
import { Label } from '@/lib/Label';
import { Divider } from '@tremor/react';
import { useState } from 'react';
import { BarLoader, DotLoader } from 'react-spinners';

type ResyncDialogProps = {
  mirrorName: string;
};

export const ResyncDialog = ({ mirrorName }: ResyncDialogProps) => {
  const [syncing, setSyncing] = useState(false);
  const [msg, setMsg] = useState<{
    msg: string;
    color: 'positive' | 'destructive' | 'base';
  }>({
    msg: '',
    color: 'base',
  });

  const handleResync = async () => {
    setSyncing(true);
    setMsg({ msg: 'Preparing resync...', color: 'base' });
    const resyncRes = await fetch('/api/v1/mirrors/resync', {
      method: 'POST',
      body: JSON.stringify({
        flowJobName: mirrorName,
        dropStats: true,
      } as ResyncMirrorRequest),
    }).then((res) => res.json());
    if (resyncRes.ok !== true) {
      setMsg({
        msg: `Unable to resync mirror ${mirrorName}. ${resyncRes.message ?? ''}`,
        color: 'destructive',
      });
      setSyncing(false);
      return;
    }
    setMsg({
      msg: 'Resync has been initiated. You may reload this window to see the progress.',
      color: 'positive',
    });
    setSyncing(false);
    return;
  };

  return (
    <Dialog
      noInteract={true}
      size='xLarge'
      triggerButton={
        <Button
          variant='normalBorderless'
          style={{ width: '100%', justifyContent: 'left' }}
        >
          <Label as='label'>Resync mirror</Label>
        </Button>
      }
    >
      <div>
        <Label as='label' variant='action'>
          Resync {mirrorName}
        </Label>
        <Divider style={{ margin: 0 }} />
        <Label as='label' variant='body' style={{ marginTop: '0.3rem' }}>
          Are you sure you want to resync this mirror?
          <br></br>
          This involves <b>dropping the existing mirror</b> and recreating it
          with initial load.
        </Label>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {syncing && <DotLoader size={15} />}
          <Label
            as='label'
            style={{ marginTop: '0.3rem' }}
            colorName='lowContrast'
            colorSet={msg.color}
          >
            {msg.msg}
          </Label>
        </div>
        <div style={{ display: 'flex', marginTop: '1rem' }}>
          <DialogClose>
            <Button
              disabled={syncing}
              style={{ backgroundColor: '#6c757d', color: 'white' }}
            >
              {msg.color === 'positive' ? 'Close' : 'Cancel'}
            </Button>
          </DialogClose>
          <Button
            disabled={syncing}
            onClick={handleResync}
            variant='normalSolid'
            style={{
              marginLeft: '1rem',
            }}
          >
            {syncing ? <BarLoader /> : 'Resync'}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
