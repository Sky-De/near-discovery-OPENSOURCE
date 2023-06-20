import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import { VmComponent } from '@/components/vm/VmComponent';
import { useBosComponents } from '@/hooks/useBosComponents';
import { useDefaultLayout } from '@/hooks/useLayout';
import { useAuthStore } from '@/stores/auth';
import { useCurrentComponentStore } from '@/stores/current-component';
import { recordClick } from '@/utils/analytics';
import type { NextPageWithLayout } from '@/utils/types';

const ViewComponentPage: NextPageWithLayout = () => {
  const router = useRouter();
  const setComponentSrc = useCurrentComponentStore((store) => store.setSrc);
  const componentSrc = `${router.query.componentAccountId}/widget/${router.query.componentName}`;
  const [componentProps, setComponentProps] = useState<Record<string, unknown>>({});
  const authStore = useAuthStore();
  const components = useBosComponents();

  useEffect(() => {
    setComponentSrc(componentSrc);
  }, [setComponentSrc, componentSrc]);

  useEffect(() => {
    setComponentProps(router.query);
  }, [router.query]);

  useEffect(() => {
    // Displays the Zendesk widget only if user is signed in and on the home page
    if (!window.zE) return;
    if (!authStore.signedIn || !!componentSrc) {
      window.zE('webWidget', 'hide');
      return;
    }
    localStorage.setItem('accountId', authStore.accountId);
    window.zE('webWidget', 'show');
  }, [authStore.accountId, authStore.signedIn, componentSrc]);

  return (
    <div className="container-xl" onPointerUp={recordClick}>
      <div className="row">
        <div
          className="d-inline-block position-relative overflow-hidden"
          style={{
            paddingTop: 'var(--body-top-padding)',
          }}
        >
          <VmComponent
            key={components.tosCheck}
            src={components.tosCheck}
            props={{
              logOut: authStore.logOut,
              targetProps: componentProps,
              targetComponent: componentSrc,
              tosName: components.tosContent,
            }}
          />
        </div>
      </div>
    </div>
  );
};

ViewComponentPage.getLayout = useDefaultLayout;

export default ViewComponentPage;
